import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { HierarchyNode, MoveDestination } from "./hierarchy-tree.types";
import { canHaveChildren, isValidChildLength } from "./hierarchy-length.util";

/**
 * Feature-local state for the Builder Hierarchy tree (sc-40233).
 *
 * This service holds the hierarchy as a presentation view-model in a
 * BehaviorSubject, mirroring the repo's custom-RxJS store pattern (see
 * `BuilderStore`). It performs NO API calls: `HierarchyLoaderService`
 * (sc-40640) fetches the real hierarchy and publishes it through `setTree`,
 * and `HierarchyEditService` (sc-40642) saves removes and moves around the
 * local changes made here. Creating and linking children come later:
 *   - sc-40236 create-new-child
 *   - sc-40237 link-existing
 *
 * It is NOT provided in root; the Hierarchy page provides it so its lifetime
 * matches the tab, consistent with how builder state is scoped.
 */
@Injectable()
export class HierarchyViewService {
    private readonly treeSubject = new BehaviorSubject<HierarchyNode[]>([]);

    /** The current hierarchy roots (typically a single root = the current learning object). */
    readonly tree$: Observable<HierarchyNode[]> =
        this.treeSubject.asObservable();

    /** Synchronous snapshot of the current tree. */
    get tree(): HierarchyNode[] {
        return this.treeSubject.value;
    }

    /** Replace the whole tree (used by tests and, later, real data loads). */
    setTree(tree: HierarchyNode[]): void {
        this.treeSubject.next(tree);
    }

    /** Toggle expand/collapse for the node with the given id. */
    toggleExpanded(id: string): void {
        const next = mapNodes(this.treeSubject.value, (node) =>
            node.id === id ? { ...node, expanded: !node.expanded } : node,
        );
        this.treeSubject.next(next);
    }

    /**
     * Whether `node` may be dropped as a child of `target`.
     *
     * Enforces the hierarchy rules the drag-and-drop predicate relies on:
     *   - the target must be editable (you cannot edit relationships inside a
     *     linked/read-only subtree);
     *   - the target length must be able to have children;
     *   - the dragged node's length must be strictly shorter than the target;
     *   - a node cannot be dropped into itself or its own descendants;
     *   - the target must not already contain the same learning object (a
     *     shared child may appear under many parents, but only once under each).
     */
    canDrop(node: HierarchyNode, target: HierarchyNode): boolean {
        if (!target.editable) {
            return false;
        }
        if (!canHaveChildren(target.length)) {
            return false;
        }
        if (node.id === target.id || isDescendant(node, target.id)) {
            return false;
        }
        // A parent cannot hold the same learning object twice. A shared child
        // may already be under `target` as a different occurrence; moving
        // another occurrence there would create a duplicate child entry.
        if (
            target.children.some(
                (child) =>
                    child.id !== node.id && sameLearningObject(child, node),
            )
        ) {
            return false;
        }

        return isValidChildLength(target.length, node.length);
    }

    /**
     * Whether `nodeId` may be MOVED (relocated within the hierarchy), which is
     * distinct from whether it may be edited.
     *
     * Movable when:
     *   - it is an editable node the author owns, OR
     *   - it is the root of a linked subtree (read-only but owned as a
     *     relationship by the consuming parent);
     * AND it is NOT inside a linked subtree (a descendant of a linked root).
     *
     * Descendants of a linked root are fully immutable: they cannot be moved
     * independently because their relationships are owned by the linked object,
     * not by the current author.
     */
    canMove(nodeId: string): boolean {
        const tree = this.treeSubject.value;
        const node = findNode(tree, nodeId);
        if (!node) {
            return false;
        }
        if (isInsideLinkedSubtree(tree, nodeId)) {
            return false;
        }

        return node.editable || !!node.linkedRoot;
    }

    /**
     * Move `nodeId` to become a child of `targetId` in the local view-model,
     * if the move is valid. Returns true when the move was applied.
     *
     * When `index` is provided, the node is inserted at that position among the
     * target's children (enabling reordering within a parent and precise
     * re-parenting); otherwise it is appended. The index is clamped to the
     * valid range and is interpreted against the target's children AFTER the
     * node has been removed, so reordering within the same parent is stable.
     *
     * A linked root moves together with its entire subtree because the node
     * object (and its `children`) is relocated as a unit; its descendants are
     * never moved independently.
     */
    moveNode(nodeId: string, targetId: string, index?: number): boolean {
        const tree = this.treeSubject.value;
        const node = findNode(tree, nodeId);
        const target = findNode(tree, targetId);

        if (!node || !target) {
            return false;
        }
        // The node must be movable at all (editable node or a linked root, and
        // not buried inside a linked subtree).
        if (!this.canMove(nodeId)) {
            return false;
        }
        // Reordering within the same parent is a move, not a re-parent, so it is
        // allowed even though `canDrop` (a re-parent check) would reject
        // target === the node's own current parent. Distinguish the two intents.
        const sameParent = this.parentIdOf(nodeId) === targetId;
        if (!sameParent && !this.canDrop(node, target)) {
            return false;
        }

        const withoutNode = removeNode(tree, nodeId);
        const inserted = mapNodes(withoutNode, (n) => {
            if (n.id !== targetId) {
                return n;
            }
            const children = [...n.children];
            const at =
                index === undefined
                    ? children.length
                    : Math.max(0, Math.min(index, children.length));
            children.splice(at, 0, node);

            return { ...n, children, expanded: true };
        });
        this.treeSubject.next(inserted);

        return true;
    }

    /**
     * Enumerate every parent the node with `nodeId` may legally move under,
     * read-only, from the current tree. This is the precise set of
     * destinations the Move Destination Picker offers so it can never present
     * a parent that `moveNode` would reject.
     *
     * Returns `[]` when the node is missing or not movable (`canMove` is
     * false) — a root, a linked-subtree descendant, or an unknown id.
     *
     * A candidate parent is included when it is the node's CURRENT parent
     * (a reorder, which `moveNode` permits via its `sameParent` branch) OR
     * `canDrop(node, candidate)` is true (a re-parent). This mirrors exactly
     * the split between `moveNode` and `canDrop`: `canDrop` rejects the node's
     * own current parent because it is a re-parent check, while `moveNode`
     * compensates to allow reordering. Self and descendants are excluded
     * inherently by `canDrop`, and the current parent is never the node or one
     * of its descendants.
     *
     * `childCount` is the candidate's current `children.length` and is the
     * append index (index === childCount means "append as last child"). When
     * the candidate is the node's current parent, childCount counts the node's
     * current siblings INCLUDING the node, matching how `moveNode` clamps
     * against the target's children after removal.
     *
     * Delegates entirely to `canMove`/`canDrop`/`parentIdOf`; it introduces no
     * new move rule of its own.
     */
    validDestinations(nodeId: string): MoveDestination[] {
        const tree = this.treeSubject.value;
        const node = findNode(tree, nodeId);
        if (!node || !this.canMove(nodeId)) {
            return [];
        }

        const currentParentId = this.parentIdOf(nodeId);
        const out: MoveDestination[] = [];
        walk(tree, (candidate) => {
            const sameParent = candidate.id === currentParentId;
            const eligible = sameParent || this.canDrop(node, candidate);
            if (!eligible) {
                return;
            }
            out.push({
                id: candidate.id,
                name: candidate.name,
                length: candidate.length,
                childCount: candidate.children.length,
                isCurrentParent: sameParent,
            });
        });

        return out;
    }

    /**
     * For every node that is NOT a valid destination for `nodeId`, a short
     * sentence saying why, keyed by node id. The picker shows it on the row so
     * the author knows why a parent is unavailable instead of only seeing it
     * dimmed.
     *
     * The node itself is omitted (the picker marks it "Moving"), as are the
     * valid destinations. Read-only reasons identify linked/inherited provenance;
     * other reasons explain the first remaining move restriction. Returns `{}` when the node
     * is missing or cannot move.
     */
    unavailableReasons(nodeId: string): Record<string, string> {
        const tree = this.treeSubject.value;
        const node = findNode(tree, nodeId);
        if (!node || !this.canMove(nodeId)) {
            return {};
        }
        const currentParentId = this.parentIdOf(nodeId);
        const nodeName = node.name?.trim() || "this object";
        const reasons: Record<string, string> = {};
        walk(tree, (candidate) => {
            if (
                candidate.id === nodeId ||
                candidate.id === currentParentId ||
                this.canDrop(node, candidate)
            ) {
                return;
            }
            if (!candidate.editable) {
                const provenance = isInsideLinkedSubtree(tree, candidate.id)
                    ? "inherited"
                    : "linked";
                reasons[candidate.id] =
                    `This object is ${provenance} and read-only. Objects cannot be moved into ${provenance} objects.`;
            } else if (isDescendant(node, candidate.id)) {
                reasons[candidate.id] = `Moves with ${nodeName}`;
            } else if (!canHaveChildren(candidate.length)) {
                reasons[candidate.id] = "Nanomodules can't hold other objects";
            } else {
                reasons[candidate.id] = `Must be longer than a ${node.length}`;
            }
        });
        return reasons;
    }
    /** The id of the direct parent of `nodeId`, or undefined if it is a root. */
    parentIdOf(nodeId: string): string | undefined {
        return parentIdOf(this.treeSubject.value, nodeId);
    }

    /** The node (occurrence) with `nodeId`, or undefined. */
    getNode(nodeId: string): HierarchyNode | undefined {
        return findNode(this.treeSubject.value, nodeId);
    }

    /** The direct parent node of `nodeId`, or undefined for a root or unknown id. */
    getParent(nodeId: string): HierarchyNode | undefined {
        const parentId = this.parentIdOf(nodeId);

        return parentId === undefined ? undefined : this.getNode(parentId);
    }

    /**
     * Remove the node (occurrence) `nodeId`, with its subtree, from the local
     * view-model. Returns true when it was removed.
     *
     * Only a node that {@link canMove} can be removed: a root, a descendant of
     * a linked root, or an unknown id is refused. A linked root is removed as a
     * whole unit. Removing an occurrence leaves every other occurrence of the
     * same learning object in place.
     */
    removeChild(nodeId: string): boolean {
        const tree = this.treeSubject.value;
        if (this.parentIdOf(nodeId) === undefined || !this.canMove(nodeId)) {
            return false;
        }
        this.treeSubject.next(removeNode(tree, nodeId));

        return true;
    }
}

/** The learning object id a node stands for (`learningObjectId ?? id`). */
function learningObjectIdOf(node: HierarchyNode): string {
    return node.learningObjectId ?? node.id;
}

/** Whether two nodes are occurrences of the same learning object. */
function sameLearningObject(a: HierarchyNode, b: HierarchyNode): boolean {
    return learningObjectIdOf(a) === learningObjectIdOf(b);
}

/** Immutably map over every node in the forest, preserving structure. */
function mapNodes(
    nodes: HierarchyNode[],
    fn: (node: HierarchyNode) => HierarchyNode,
): HierarchyNode[] {
    return nodes.map((node) => {
        const mapped = fn(node);

        return { ...mapped, children: mapNodes(mapped.children, fn) };
    });
}

/** Find a node by id anywhere in the forest. */
function findNode(
    nodes: HierarchyNode[],
    id: string,
): HierarchyNode | undefined {
    for (const node of nodes) {
        if (node.id === id) {
            return node;
        }
        const found = findNode(node.children, id);
        if (found) {
            return found;
        }
    }

    return undefined;
}

/** Visit every node in the forest in pre-order (parent before its children). */
function walk(nodes: HierarchyNode[], fn: (node: HierarchyNode) => void): void {
    for (const node of nodes) {
        fn(node);
        walk(node.children, fn);
    }
}

/** Whether `id` is `node` itself or appears anywhere in its subtree. */
function isDescendant(node: HierarchyNode, id: string): boolean {
    return !!findNode(node.children, id);
}

/**
 * Whether the node with `targetId` sits inside a linked subtree — i.e. it has
 * an ANCESTOR marked `linkedRoot`. The linked root itself is NOT "inside" a
 * linked subtree (it is the boundary), so it remains movable; everything below
 * it is immutable.
 */
function isInsideLinkedSubtree(
    nodes: HierarchyNode[],
    targetId: string,
    underLinkedRoot = false,
): boolean {
    for (const node of nodes) {
        if (node.id === targetId) {
            return underLinkedRoot;
        }
        // Descend; once we pass through a linked root, everything beneath it is
        // inside a linked subtree.
        if (
            isInsideLinkedSubtree(
                node.children,
                targetId,
                underLinkedRoot || !!node.linkedRoot,
            )
        ) {
            return true;
        }
    }

    return false;
}

/** Return a new forest with the node of the given id removed. */
function removeNode(nodes: HierarchyNode[], id: string): HierarchyNode[] {
    return nodes
        .filter((node) => node.id !== id)
        .map((node) => ({ ...node, children: removeNode(node.children, id) }));
}

/** Find the id of the direct parent of `childId`, or undefined for a root. */
function parentIdOf(
    nodes: HierarchyNode[],
    childId: string,
    parent?: string,
): string | undefined {
    for (const node of nodes) {
        if (node.id === childId) {
            return parent;
        }
        const found = parentIdOf(node.children, childId, node.id);
        if (found !== undefined) {
            return found;
        }
    }

    return undefined;
}
