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
