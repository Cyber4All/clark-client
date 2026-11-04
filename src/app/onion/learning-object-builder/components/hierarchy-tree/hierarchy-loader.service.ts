import { Injectable, OnDestroy } from "@angular/core";
import { BehaviorSubject, forkJoin, Observable, of, Subscription } from "rxjs";
import { map, switchMap } from "rxjs/operators";
import { LearningObject } from "@entity";
import { AuthService } from "../../../../core/auth-module/auth.service";
import { HierarchyService } from "../../../../core/learning-object-module/hierarchy/hierarchy.service";
import { toHierarchyNode } from "./hierarchy-node.mapper";
import { LENGTH_ORDER, canHaveChildren } from "./hierarchy-length.util";
import { HierarchyViewService } from "./hierarchy-view.service";
import {
    HierarchyLoadStatus,
    HierarchyNode,
    HierarchyViewer,
} from "./hierarchy-tree.types";

/**
 * Loads the author's real hierarchy into {@link HierarchyViewService} (sc-40640).
 *
 * The gateway has no "whole tree" route, so the tree is assembled from the
 * existing `GET /learning-objects/:id/children` route (direct children only):
 * one request per non-leaf node, fanned out one level at a time. Safeguards:
 *   - nanomodules are never queried (they cannot have children);
 *   - an id already placed in the tree is skipped, which breaks cycles;
 *   - depth is capped at the number of lengths.
 *
 * A failed request anywhere fails the whole load (status `error`) so the tab
 * never shows a silently partial hierarchy. {@link retry} re-runs the load.
 *
 * Page-scoped, like {@link HierarchyViewService}.
 */
@Injectable()
export class HierarchyLoaderService implements OnDestroy {
    private readonly statusSubject = new BehaviorSubject<HierarchyLoadStatus>(
        "loading",
    );

    /** Current load state of the tab. */
    readonly status$: Observable<HierarchyLoadStatus> =
        this.statusSubject.asObservable();

    private lastRoot?: LearningObject;
    private loadSubscription?: Subscription;

    constructor(
        private hierarchyService: HierarchyService,
        private viewService: HierarchyViewService,
        private authService: AuthService,
    ) {}

    /** Load the hierarchy rooted at `root`, cancelling any load in flight. */
    load(root: LearningObject): void {
        this.lastRoot = root;
        this.loadSubscription?.unsubscribe();
        this.statusSubject.next("loading");

        const viewer: HierarchyViewer = {
            username: this.authService.username,
            isAdminOrEditor: this.authService.isAdminOrEditor(),
        };
        const visited = new Set<string>([root.id]);

        this.loadSubscription = this.fetchChildren$(
            root.id,
            root.length,
            false,
            viewer,
            visited,
            0,
        ).subscribe({
            next: (children) => {
                const rootNode: HierarchyNode = {
                    id: root.id,
                    name: root.name,
                    length: root.length,
                    editable: true,
                    expanded: true,
                    children,
                };
                this.viewService.setTree([rootNode]);
                this.statusSubject.next(children.length ? "ready" : "empty");
            },
            error: () => {
                this.viewService.setTree([]);
                this.statusSubject.next("error");
            },
        });
    }

    /** Re-run the last load (used by the error state's Retry button). */
    retry(): void {
        if (this.lastRoot) {
            this.load(this.lastRoot);
        }
    }

    ngOnDestroy(): void {
        this.loadSubscription?.unsubscribe();
        this.statusSubject.complete();
    }

    private fetchChildren$(
        parentId: string,
        parentLength: LearningObject.Length,
        parentReadOnly: boolean,
        viewer: HierarchyViewer,
        visited: Set<string>,
        depth: number,
    ): Observable<HierarchyNode[]> {
        if (!canHaveChildren(parentLength) || depth >= LENGTH_ORDER.length) {
            return of([]);
        }

        return this.hierarchyService.getChildren(parentId).pipe(
            switchMap((payloads) => {
                const fresh = (payloads ?? []).filter((payload) => {
                    if (!payload?.id || visited.has(payload.id)) {
                        return false;
                    }
                    visited.add(payload.id);

                    return true;
                });
                if (!fresh.length) {
                    return of([] as HierarchyNode[]);
                }

                return forkJoin(
                    fresh.map((payload) => {
                        const node = toHierarchyNode(
                            payload,
                            viewer,
                            parentReadOnly,
                        );

                        return this.fetchChildren$(
                            node.id,
                            node.length,
                            !node.editable,
                            viewer,
                            visited,
                            depth + 1,
                        ).pipe(map((children) => ({ ...node, children })));
                    }),
                );
            }),
        );
    }
}
