import { LearningObject } from "@entity";

/**
 * Hierarchy length ordering helpers for the Builder Hierarchy tree (sc-40233).
 *
 * The CLARK hierarchy rule is: a child must always be SHORTER than its parent,
 * and a Nanomodule cannot have children. Length order (shortest -> longest) is:
 *
 *   Nanomodule < Micromodule < Module < Unit < Course
 *
 * This ordering is the single source of truth derived from the declaration
 * order of `LearningObject.Length`. Other spots in the repo re-express this
 * order ad hoc (e.g. the `lengths` array in add-child and an if-ladder in the
 * admin hierarchy builder); this helper exists so the Hierarchy tab's
 * validity checks do not add yet another hard-coded copy.
 */

/** Lengths ordered shortest -> longest, taken from the `LearningObject.Length` enum declaration order. */
export const LENGTH_ORDER: readonly LearningObject.Length[] = Object.values(
    LearningObject.Length,
);

/**
 * Numeric rank of a length, where a larger rank means a longer learning object.
 *
 * @returns the index in {@link LENGTH_ORDER}, or -1 if the length is unknown.
 */
export function lengthRank(length: LearningObject.Length): number {
    return LENGTH_ORDER.indexOf(length);
}

/**
 * Whether `childLength` is a valid child of `parentLength`.
 *
 * Valid when the child is strictly shorter than the parent. Because a
 * Nanomodule is the shortest length, nothing can be a child of a Nanomodule,
 * which satisfies the "a Nanomodule cannot have children" rule.
 */
export function isValidChildLength(
    parentLength: LearningObject.Length,
    childLength: LearningObject.Length,
): boolean {
    const parentRank = lengthRank(parentLength);
    const childRank = lengthRank(childLength);

    if (parentRank < 0 || childRank < 0) {
        return false;
    }

    return childRank < parentRank;
}

/** Whether a learning object of this length is allowed to have any children. */
export function canHaveChildren(length: LearningObject.Length): boolean {
    return lengthRank(length) > lengthRank(LearningObject.Length.NANOMODULE);
}
