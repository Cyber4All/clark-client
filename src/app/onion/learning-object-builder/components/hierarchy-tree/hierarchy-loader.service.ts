import { Injectable, OnDestroy } from "@angular/core";
import {
    BehaviorSubject,
    forkJoin,
    from,
    Observable,
    of,
    Subscription,
} from "rxjs";
import { map, switchMap } from "rxjs/operators";
import { LearningObject } from "@entity";
import { AuthService } from "../../../../core/auth-module/auth.service";
import { LearningObjectService } from "../../../../core/learning-object-module/learning-object/learning-object.service";
import { builderIdentity, toHierarchyNode } from "./hierarchy-node.mapper";
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
 * existing `LearningObjectService.getLearningObjectChildren` (direct children
 * only, `GET /learning-objects/:id/children`), fanned out one level at a time.
 *
 * A learning object can have several parents, so the same learning object may
 * legitimately appear under more than one parent. Safeguards therefore work
 * per branch, never across the whole tree:
 *   - cycles: a child whose learning object id is already on the path from the
 *     root to its parent (an ancestor) is skipped;
 *   - a child repeated inside ONE parent's response is kept once;
 *   - nanomodules are never queried (they cannot have children);
 *   - depth is capped at the number of lengths.
 * Each appearance gets its own unique node `id` (its path from the root) and
 * carries the real `learningObjectId`. Results do not depend on the order in
 * which requests resolve.
 *
 * Requests are memoized per learning object id for the duration of one load,
 * so a child shared by N parents costs one request. A new load starts a fresh
 * cache, so {@link retry} always refetches.
 *
 * A failed request anywhere fails the whole load (status `error`) so the tab
 * never shows a silently partial hierarchy.
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
        private learningObjectService: LearningObjectService,
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
        // One request per learning object for this load (shared children).
        const requests = new Map<string, Promise<LearningObject[]>>();
        const fetchChildren = (id: string): Promise<LearningObject[]> => {
            let request = requests.get(id);
            if (!request) {
                request =
                    this.learningObjectService.getLearningObjectChildren(id);
                requests.set(id, request);
            }

            return request;
        };

        this.loadSubscription = this.fetchChildren$({
            parentId: root.id,
            parentKey: root.id,
            parentLength: root.length,
            parentReadOnly: false,
            ancestors: new Set<string>([root.id]),
            depth: 0,
            viewer,
            fetchChildren,
        }).subscribe({
            next: (children) => {
                const rootNode: HierarchyNode = {
                    id: root.id,
                    learningObjectId: root.id,
                    ...builderIdentity(root),
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

    private fetchChildren$(ctx: {
        /** Learning object id of the parent (used for the request). */
        parentId: string;
        /** Occurrence key of the parent (prefix for child keys). */
        parentKey: string;
        parentLength: LearningObject.Length;
        parentReadOnly: boolean;
        /** Learning object ids on the path from the root through the parent. */
        ancestors: ReadonlySet<string>;
        depth: number;
        viewer: HierarchyViewer;
        fetchChildren: (id: string) => Promise<LearningObject[]>;
    }): Observable<HierarchyNode[]> {
        if (
            !canHaveChildren(ctx.parentLength) ||
            ctx.depth >= LENGTH_ORDER.length
        ) {
            return of([]);
        }

        return from(ctx.fetchChildren(ctx.parentId)).pipe(
            switchMap((payloads) => {
                const seenInParent = new Set<string>();
                const children = (payloads ?? []).filter((payload) => {
                    if (
                        !payload?.id ||
                        ctx.ancestors.has(payload.id) ||
                        seenInParent.has(payload.id)
                    ) {
                        return false;
                    }
                    seenInParent.add(payload.id);

                    return true;
                });
                if (!children.length) {
                    return of([] as HierarchyNode[]);
                }

                return forkJoin(
                    children.map((payload) => {
                        const node = toHierarchyNode(
                            payload,
                            ctx.viewer,
                            ctx.parentReadOnly,
                            `${ctx.parentKey}/${payload.id}`,
                        );

                        return this.fetchChildren$({
                            ...ctx,
                            parentId: payload.id,
                            parentKey: node.id,
                            parentLength: node.length,
                            parentReadOnly: !node.editable,
                            ancestors: new Set([...ctx.ancestors, payload.id]),
                            depth: ctx.depth + 1,
                        }).pipe(map((kids) => ({ ...node, children: kids })));
                    }),
                );
            }),
        );
    }
}
