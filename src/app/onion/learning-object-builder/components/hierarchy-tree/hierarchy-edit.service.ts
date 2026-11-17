import { Injectable } from "@angular/core";
import { BehaviorSubject, defer, from, Observable, of, throwError } from "rxjs";
import { catchError, finalize, map, switchMap } from "rxjs/operators";
import { LearningObjectService } from "../../../../core/learning-object-module/learning-object/learning-object.service";
import { LearningObject } from "@entity";
import { HierarchyViewService } from "./hierarchy-view.service";
import { HierarchyNode, NewChildRequest } from "./hierarchy-tree.types";
import { builderIdentity } from "./hierarchy-node.mapper";
import { canHaveChildren, isValidChildLength } from "./hierarchy-length.util";

/**
 * Characters the API refuses in a learning object name. Mirrors
 * `CreateLearningObjectDTO` in clark-service; the API stays the authority.
 */
export const INVALID_NAME_CHARACTERS = /[\\/"*|]/;

/** Why a hierarchy edit did not complete. */
export type HierarchyEditFailure =
    /** Another edit is still saving. Nothing changed and nothing was sent. */
    | "busy"
    /** The edit is not allowed by the hierarchy rules. Nothing was sent. */
    | "invalid"
    /** The API rejected or failed the request. The tree was rolled back. */
    | "failed"
    /** Create only: another learning object of yours already has this name. */
    | "name-taken"
    /** Create only: the name is empty or has characters the API refuses. */
    | "name-invalid";

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
        /**
         * Create only: a learning object was created but could not be attached
         * (or have its length set) and could not be removed again. It is in the
         * author's library and not in the hierarchy.
         */
        readonly leftInLibrary = false,
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

/** What a completed create changed: the outcome plus the node that was added. */
export interface HierarchyCreateOutcome extends HierarchyEditOutcome {
    /** The new child as it now appears in the tree. */
    node: HierarchyNode;
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
 * Creating a child (sc-40236) follows the same path the Dashboard "New" button
 * uses: `LearningObjectService.create` (a shell object that is always a
 * Nanomodule), then `save` for the length, then attach to the parent with
 * `setChildren`. The tree is changed only after all three succeed, so there is
 * nothing to roll back in the view. If the length or attach step fails, the
 * object created a moment ago is deleted so the library is not left with an
 * object the author never saw.
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

    /**
     * Create a new learning object named `request.name` with `request.length`
     * and attach it as the last child of the node `parentNodeId`.
     *
     * Emits the created node once it is saved and in the tree. Errors with a
     * {@link HierarchyEditError}: `name-taken` and `name-invalid` for name
     * problems (nothing was created), `invalid` and `busy` when refused up
     * front, and `failed` when the API failed. The tree is unchanged on every
     * error.
     */
    create(
        parentNodeId: string,
        request: NewChildRequest,
    ): Observable<HierarchyCreateOutcome> {
        return defer((): Observable<HierarchyCreateOutcome> => {
            const parent = this.viewService.getNode(parentNodeId);
            const name = request?.name?.trim() ?? "";
            if (
                !parent ||
                !name ||
                !parent.editable ||
                !canHaveChildren(parent.length) ||
                !isValidChildLength(parent.length, request.length)
            ) {
                return this.refuse(name ? "invalid" : "name-invalid");
            }
            if (INVALID_NAME_CHARACTERS.test(name)) {
                return this.refuse("name-invalid");
            }
            if (this.saving) {
                return this.refuse("busy");
            }

            const parentId = learningObjectIdOf(parent);
            const parentName = parent.name?.trim() || "Unnamed object";
            const reloadRecommended =
                countLearningObject(this.viewService.tree, parentId) > 1;
            this.savingSubject.next(true);

            return from(
                this.learningObjectService.checkNameAvailability(name),
            ).pipe(
                // If the check itself fails, let the create call decide: the
                // API checks the name again and is the authority.
                catchError(() => of(true)),
                switchMap((available) =>
                    available
                        ? of(undefined)
                        : throwError(new HierarchyEditError("name-taken")),
                ),
                switchMap(() =>
                    from(
                        this.learningObjectService.create({
                            name,
                            length: request.length,
                            status: LearningObject.Status.UNRELEASED,
                        }),
                    ).pipe(
                        catchError((cause) =>
                            throwError(this.createFailure(cause)),
                        ),
                    ),
                ),
                switchMap((created: LearningObject) => {
                    const childId = created.id;

                    return from(
                        this.learningObjectService.save(childId, {
                            length: request.length,
                        }),
                    ).pipe(
                        catchError((cause) =>
                            this.discard(childId, cause, false),
                        ),
                        switchMap(() =>
                            from(
                                this.learningObjectService.setChildren(
                                    parentId,
                                    [childId],
                                    false,
                                ),
                            ).pipe(
                                catchError((cause) =>
                                    this.discard(childId, cause, true),
                                ),
                            ),
                        ),
                        map((): HierarchyCreateOutcome => {
                            const node = this.viewService.addChild(
                                parentNodeId,
                                {
                                    learningObjectId: childId,
                                    ...builderIdentity(created),
                                    name,
                                    length: request.length,
                                    editable: true,
                                },
                            );
                            if (!node) {
                                // Saved on the server but the tree cannot show
                                // it; reload to show what is saved.
                                throw new HierarchyEditError("failed", true);
                            }

                            return {
                                name,
                                parentName,
                                reloadRecommended,
                                node,
                            };
                        }),
                    );
                }),
                catchError((error) =>
                    throwError(
                        error instanceof HierarchyEditError
                            ? error
                            : new HierarchyEditError("failed", false, error),
                    ),
                ),
                finalize(() => this.savingSubject.next(false)),
            );
        });
    }

    /** Map a failed create call to a name error where the API says so. */
    private createFailure(cause: any): HierarchyEditError {
        if (cause?.status === 409) {
            return new HierarchyEditError("name-taken", false, cause);
        }
        if (cause?.status === 400) {
            return new HierarchyEditError("name-invalid", false, cause);
        }

        return new HierarchyEditError("failed", false, cause);
    }

    /**
     * A step after the create failed: delete the object this call created and
     * surface `failed`. `attachStep` is true when the failing call was the
     * attach, which may have been applied on the server even though the client
     * saw an error; if the delete also fails the hierarchy must be reloaded.
     */
    private discard(
        childId: string,
        cause: unknown,
        attachStep: boolean,
    ): Observable<never> {
        return from(this.learningObjectService.delete(childId)).pipe(
            map(() => false),
            catchError(() => of(true)),
            switchMap((leftInLibrary) =>
                throwError(
                    new HierarchyEditError(
                        "failed",
                        leftInLibrary && attachStep,
                        cause,
                        leftInLibrary,
                    ),
                ),
            ),
        );
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
