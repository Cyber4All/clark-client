import { LearningObject } from "@entity";

/**
 * View-model for a single node in the Builder Hierarchy tree.
 *
 * This is a feature-local presentation model for sc-40233. It intentionally
 * does NOT reuse the persisted `LearningObject` entity directly because the
 * tree needs presentation-only state (expanded, editable/linked) and, for this
 * story, is driven by mock/local data rather than real API responses.
 *
 * Later stories (sc-40236 wire create-new-child, sc-40237 wire link-existing)
 * replace the mock source that produces these nodes with real hierarchy data;
 * the shape here is the seam they attach to.
 */
export interface HierarchyNode {
    /** Stable id for tracking/trackBy. For mock data this is a local id. */
    id: string;

    /** Display name of the learning object. */
    name: string;

    /** Length of the learning object; drives the length pill and the ordering/validity rules. */
    length: LearningObject.Length;

    /**
     * Whether the current user may EDIT this node: rename it, change its length,
     * add/remove/reorder its own children, or open its Builder.
     *
     * `false` marks a linked/read-only node whose content and internal
     * relationships are owned by another object/author. Editability is about
     * modification only — it does not by itself decide whether the node can be
     * MOVED. See {@link linkedRoot}.
     */
    editable: boolean;

    /**
     * Marks the ROOT of a linked subtree — the object the author searched for
     * and linked into their hierarchy.
     *
     * A linked root is read-only ({@link editable} is `false`) but may still be
     * MOVED as a whole unit (with its entire subtree) into any valid parent,
     * because the author owns the relationship that references it. Its
     * descendants are NOT linked roots: they are fully immutable — they cannot
     * be moved independently, dropped onto, renamed, or re-parented.
     *
     * Only set on the top node of a linked subtree; omitted/false elsewhere.
     */
    linkedRoot?: boolean;

    /** Direct children of this node (the composed/effective subtree). */
    children: HierarchyNode[];

    /** Presentation-only expand/collapse state for this branch. */
    expanded?: boolean;
}

/** Discriminates the two actions offered by a node's `+` contextual menu. */
export type AddChildAction = "create-new" | "add-existing";

/**
 * Stable identifier for an Action_Menu item on a Node_Row.
 *
 * Each action has a unique id so additional actions (e.g. the future
 * "add-child" Add Child Object action) can be added to the same menu structure
 * without identifier collision. `"move"` is the only working action this phase.
 */
export type NodeActionId = "move" | "add-child";

/** A single rendered Action_Menu item for a node row. */
export interface NodeAction {
    /** Unique action identifier within the node's Action_Menu. */
    id: NodeActionId;

    /** Visible, human-readable label, e.g. "Move Object". */
    label: string;

    /** FontAwesome classes for the item icon, matching the tree's icon style. */
    icon: string;

    /**
     * Whether the item is disabled/non-selectable. "Move Object" is disabled
     * when `canMove` is false — a root, a linked-subtree descendant, or when
     * eligibility is undetermined.
     */
    disabled: boolean;
}

/**
 * A single valid destination parent for a pending non-drag move, surfaced by
 * the Move_Destination_Picker. Computed read-only from the current tree using
 * the same predicates the drag path uses, so the picker never offers a
 * destination the move engine would reject.
 */
export interface MoveDestination {
    /** Destination parent node id (passed to `moveNode` as targetId). */
    id: string;

    /** Destination parent display name (for the picker list; may be ""). */
    name: string;

    /** Destination parent length, for badge/icon parity with the tree. */
    length: LearningObject.Length;

    /**
     * Current child count of the destination parent. Equals the append index
     * (index === childCount means "append as last child").
     */
    childCount: number;

    /** True when this destination is the node's current parent (reorder). */
    isCurrentParent: boolean;
}
