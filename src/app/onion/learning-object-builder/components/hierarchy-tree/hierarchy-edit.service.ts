import { Injectable } from "@angular/core";
import { BehaviorSubject, defer, from, Observable, of, throwError } from "rxjs";
import { catchError, finalize, map, switchMap } from "rxjs/operators";
import { LearningObjectService } from "../../../../core/learning-object-module/learning-object/learning-object.service";
import { HierarchyViewService } from "./hierarchy-view.service";
import { HierarchyNode } from "./hierarchy-tree.types";

/** Why a hierarchy edit did not complete. */
export type HierarchyEditFailure =
    /** Another edit is still saving. Nothing changed and nothing was sent. */
    | "busy"
    /** The edit is not allowed by the hierarchy rules. Nothing was sent. */
    | "invalid"
    /** The API rejected or failed the request. The tree was rolled back. */
    | "failed";

/**
 * Error emitted by {@link HierarchyEditService} when an edit does not complete.
 * The tree has already been restored when this is emitted.
 */
export class HierarchyEditError extends Error {
    constructor(
        readonly reason: HierarchyEditFailure,
        /**
         * True when the API may now differ from what the tree shows (a move
         * that was half applied and could not be undone). The caller should
         * reload the hierarchy from the server.
         */
        readonly reloadRequired = false,
        readonly cause?: unknown,
    ) {
        super(`Hierarchy edit not completed: ${reason}`);
        Object.setPrototypeOf(this, HierarchyEditError.prototype);
    }
}

/** What a completed edit changed, for toasts and announcements. */
export interface HierarchyEditOutcome {
    /** Name of the child that was removed or moved. */
    name: string;
    /** Name of the parent it left (remove) or the parent it moved into (move). */
    parentName: string;
    /**
     * True when the tree should be reloaded from the server because the edited
     * parent also appears elsewhere in the tree. A parent-child link belongs to
     * the parent learning object, so every occurrence of that parent changes
     * with it on the server, while only one occurrence changed locally.
     */
    reloadRecommended: boolean;
}

/**
 * Persists author edits to the Builder Hierarchy (sc-40642).
 *
 * Each edit is applied to the tree optimistically through
 * {@link HierarchyViewService}, sent to the API, and rolled back to the exact
 * previous tree if the API fails. Only ONE edit may be in flight: a rollback
 * is only correct when nothing else changed the tree meanwhile, so a second
 * edit is refused with `busy` rather than queued.
 *
 * API calls use the existing `LearningObjectService.setChildren` (add and remove
 * a child of a parent). They are keyed by LEARNING OBJECT id, never by the
 * occurrence `id` of a node. There is no atomic "move" route, so a re-parent is
 * two calls: add to the new parent, then remove from the old one. Adding first
 * means a failure can duplicate a child briefly but can never lose it.
 *
 * The API cannot persist the ORDER of children yet (see the sc-40642 ExecPlan),
 * so reordering inside one parent is refused as `invalid`.
 *
 * Page-scoped, like {@link HierarchyViewService}.
 */
@Injectable()
export class HierarchyEditService {
    private readonly savingSubject = new BehaviorSubject<boolean>(false);

    /** True while an edit is being saved. */
    readonly saving$: Observable<boolean> = this.savingSubject.asObservable();

    constructor(
        private learningObjectService: LearningObjectService,
        private viewService: HierarchyViewService,
    ) {}

    /** Synchronous snapshot of {@link saving$}. */
    get saving(): boolean {
        return this.savingSubject.value;
    }

    /**
     * Unlink the child occurrence `nodeId` from its parent. The learning object
     * itself is not deleted and stays in the author's library.
     */
    remove(nodeId: string): Observable<HierarchyEditOutcome> {
        return defer((): Observable<HierarchyEditOutcome> => {
            const node = this.viewService.getNode(nodeId);
            const parent = this.viewService.getParent(nodeId);
            if (!node || !parent || !this.viewService.canMove(nodeId)) {
                return this.refuse("invalid");
            }
            if (this.saving) {
                return this.refuse("busy");
            }

            const outcome = this.outcome(node, parent, parent);
            const snapshot = this.viewService.tree;
            if (!this.viewService.removeChild(nodeId)) {
                return this.refuse("invalid");
            }
            this.savingSubject.next(true);

            return from(
                this.learningObjectService.setChildren(
                    learningObjectIdOf(parent),
                    [learningObjectIdOf(node)],
                    true,
                ),
            ).pipe(
                map(() => outcome),
                catchError((cause) => this.rollback(snapshot, false, cause)),
                finalize(() => this.savingSubject.next(false)),
            );
        });
    }

    /**
     * Move the child occurrence `nodeId` under `targetId` (appended as the last
     * child). A linked root moves with its whole subtree.
     */
    move(nodeId: string, targetId: string): Observable<HierarchyEditOutcome> {
        return defer((): Observable<HierarchyEditOutcome> => {
            const node = this.viewService.getNode(nodeId);
            const target = this.viewService.getNode(targetId);
            const oldParent = this.viewService.getParent(nodeId);
            if (
                !node ||
                !target ||
                !oldParent ||
                !this.viewService.canMove(nodeId) ||
                !this.viewService.canDrop(node, target) ||
                // Same parent (or another occurrence of it) is a reorder, which
                // the API cannot persist, and an add+remove would drop the child.
                learningObjectIdOf(oldParent) === learningObjectIdOf(target)
            ) {
                return this.refuse("invalid");
            }
            if (this.saving) {
                return this.refuse("busy");
            }

            const outcome = this.outcome(node, oldParent, target);
            const snapshot = this.viewService.tree;
            const childId = learningObjectIdOf(node);
            const newParentId = learningObjectIdOf(target);
            const oldParentId = learningObjectIdOf(oldParent);
            if (!this.viewService.moveNode(nodeId, targetId)) {
                return this.refuse("invalid");
            }
            this.savingSubject.next(true);

            return from(
                this.learningObjectService.setChildren(
                    newParentId,
                    [childId],
                    false,
                ),
            ).pipe(
                switchMap(() =>
                    from(
                        this.learningObjectService.setChildren(
                            oldParentId,
                            [childId],
                            true,
                        ),
                    ).pipe(
                        // The child is now under BOTH parents. Take it back out
                        // of the new one; if that fails too, the server state
                        // is uncertain and the caller must reload.
                        catchError((cause) =>
                            this.undoAdd(newParentId, childId).pipe(
                                switchMap((undone) =>
                                    throwError(
                                        new HierarchyEditError(
                                            "failed",
                                            !undone,
                                            cause,
                                        ),
                                    ),
                                ),
                            ),
                        ),
                    ),
                ),
                map(() => outcome),
                catchError((cause) => this.rollback(snapshot, false, cause)),
                finalize(() => this.savingSubject.next(false)),
            );
        });
    }

    /** Best effort removal of `childId` from `parentId`; emits whether it worked. */
    private undoAdd(parentId: string, childId: string): Observable<boolean> {
        return from(
            this.learningObjectService.setChildren(parentId, [childId], true),
        ).pipe(
            map(() => true),
            catchError(() => of(false)),
        );
    }

    /** Restore the tree and surface a `failed` error (keeping a prior reload flag). */
    private rollback(
        snapshot: HierarchyNode[],
        reloadRequired: boolean,
        cause: unknown,
    ): Observable<never> {
        this.viewService.setTree(snapshot);
        if (cause instanceof HierarchyEditError) {
            return throwError(cause);
        }

        return throwError(
            new HierarchyEditError("failed", reloadRequired, cause),
        );
    }

    private refuse(reason: HierarchyEditFailure): Observable<never> {
        return throwError(new HierarchyEditError(reason));
    }

    private outcome(
        node: HierarchyNode,
        oldParent: HierarchyNode,
        newParent: HierarchyNode,
    ): HierarchyEditOutcome {
        const lookup = (n: HierarchyNode) => n.name?.trim() || "Unnamed object";
        const tree = this.viewService.tree;
        const occurrences = (parent: HierarchyNode) =>
            countLearningObject(tree, learningObjectIdOf(parent));

        return {
            name: lookup(node),
            parentName: lookup(newParent),
            reloadRecommended:
                occurrences(oldParent) > 1 || occurrences(newParent) > 1,
        };
    }
}

function learningObjectIdOf(node: HierarchyNode): string {
    return node.learningObjectId ?? node.id;
}

/** How many nodes in the forest stand for the learning object `id`. */
function countLearningObject(nodes: HierarchyNode[], id: string): number {
    return nodes.reduce(
        (total, node) =>
            total +
            (learningObjectIdOf(node) === id ? 1 : 0) +
            countLearningObject(node.children, id),
        0,
    );
}
