import * as fc from "fast-check";
import { LearningObject } from "@entity";
import { HierarchyNode } from "./hierarchy-tree.types";
import { LENGTH_ORDER, lengthRank } from "./hierarchy-length.util";

/**
 * Shared fast-check generators and lookup helpers for hierarchy move tests.
 *
 * Generated forests have unique node IDs, strictly decreasing child lengths,
 * and a mixture of editable nodes, linked leaves, and read-only linked subtrees.
 * All service tests use this generator to keep their hierarchy assumptions consistent.
 */

const { NANOMODULE } = LearningObject.Length;

/** How a child node in an editable context is produced. */
type ChildKind = "editable" | "linkedLeaf" | "linkedRoot";

/** All lengths that are allowed to have children (everything longer than a Nanomodule). */
const PARENT_CAPABLE_LENGTHS: readonly LearningObject.Length[] =
    LENGTH_ORDER.filter((l) => l !== NANOMODULE);

/**
 * A monotonic id source so every generated node gets a unique id regardless of
 * how the recursive arbitrary interleaves. Reset per forest build.
 */
interface IdSource {
    next(): string;
}

function makeIdSource(): IdSource {
    let counter = 0;

    return {
        next: () => `n${counter++}`,
    };
}

/** Lengths strictly shorter than `parentLength`, i.e. the legal child lengths. */
function childLengthsOf(
    parentLength: LearningObject.Length,
): LearningObject.Length[] {
    const parentRank = lengthRank(parentLength);

    return LENGTH_ORDER.filter((l) => lengthRank(l) < parentRank);
}

/**
 * Build a subtree rooted at a node of `length`.
 *
 * `editableContext`:
 *   - "editable"       -> this node is editable and MAY spawn either editable
 *                         children, linked leaves, or new linked roots.
 *   - "linkedReadOnly" -> this node is inside a linked subtree: it is read-only
 *                         (`editable: false`) and so are ALL of its descendants;
 *                         it is never itself a linkedRoot.
 *
 * Depth/breadth are driven by the `name`/structure arbitraries so the resulting
 * forest varies run to run while always respecting the length ordering.
 */
function buildSubtree(
    ids: IdSource,
    length: LearningObject.Length,
    editableContext: "editable" | "linkedReadOnly",
): fc.Arbitrary<HierarchyNode> {
    const legalChildLengths = childLengthsOf(length);
    const canHaveChildren = legalChildLengths.length > 0;

    // Choose how each child is produced. In an editable context a child may be:
    //   - a normal editable node,
    //   - a linked leaf (read-only, no children), or
    //   - a linked root (read-only subtree).
    // The "editable" bias (listed twice) keeps most of the forest editable while
    // still generating a healthy share of linked leaves and linked roots.
    // Inside a linked subtree every descendant is plain read-only.
    const childArb = (childLength: LearningObject.Length) =>
        editableContext === "editable"
            ? fc
                  .constantFrom<ChildKind>(
                      "editable",
                      "editable",
                      "linkedLeaf",
                      "linkedRoot",
                  )
                  .chain((kind) => buildChild(ids, childLength, kind))
            : buildSubtree(ids, childLength, "linkedReadOnly");

    const childrenArb: fc.Arbitrary<HierarchyNode[]> = canHaveChildren
        ? fc
              .array(fc.constantFrom(...legalChildLengths), {
                  minLength: 0,
                  maxLength: 3,
              })
              .chain((childLengths) =>
                  childLengths.length === 0
                      ? fc.constant<HierarchyNode[]>([])
                      : fc.tuple(...childLengths.map((cl) => childArb(cl))),
              )
        : fc.constant<HierarchyNode[]>([]);

    return fc
        .record({
            name: fc.oneof(
                fc.constant(""), // exercise the unnamed-node path too
                fc.string({ minLength: 1, maxLength: 20 }),
            ),
            expanded: fc.boolean(),
            children: childrenArb,
        })
        .map(({ name, expanded, children }) => ({
            id: ids.next(),
            name,
            length,
            editable: editableContext === "editable",
            expanded,
            children,
        }));
}

/**
 * Produce a single child node of a given `kind` at `childLength`.
 *   - "editable"   -> a normal editable subtree.
 *   - "linkedLeaf" -> a read-only leaf (no children), i.e. a linked single object.
 *   - "linkedRoot" -> a read-only subtree whose root carries `linkedRoot: true`
 *                     and whose descendants are all read-only.
 */
function buildChild(
    ids: IdSource,
    childLength: LearningObject.Length,
    kind: "editable" | "linkedLeaf" | "linkedRoot",
): fc.Arbitrary<HierarchyNode> {
    if (kind === "editable") {
        return buildSubtree(ids, childLength, "editable");
    }

    if (kind === "linkedLeaf") {
        return fc
            .oneof(fc.constant(""), fc.string({ minLength: 1, maxLength: 20 }))
            .map((name) => ({
                id: ids.next(),
                name,
                length: childLength,
                editable: false,
                children: [],
            }));
    }

    // linkedRoot: a read-only subtree, flagged as the linked root.
    return buildSubtree(ids, childLength, "linkedReadOnly").map((subtree) => ({
        ...subtree,
        linkedRoot: true,
    }));
}

/**
 * An arbitrary VALID `HierarchyNode` forest.
 *
 * Shape: one or more roots, each a Course/Unit/Module (parent-capable length)
 * so there is room for depth and for the length ordering to matter. Every tree
 * respects the strict child-shorter-than-parent rule, ids are globally unique,
 * and the forest mixes editable, linked-leaf, and linked-root nodes.
 *
 * The service tests import this generator directly and seed a fresh
 * `HierarchyViewService` via `setTree(forest)`.
 */
export const arbHierarchyForest: fc.Arbitrary<HierarchyNode[]> = fc
    .array(fc.constantFrom(...PARENT_CAPABLE_LENGTHS), {
        minLength: 1,
        maxLength: 2,
    })
    .chain((rootLengths) => {
        // One shared id source per forest guarantees unique ids across all roots.
        const ids = makeIdSource();

        return fc.tuple(
            ...rootLengths.map((length) =>
                buildSubtree(ids, length, "editable"),
            ),
        );
    });

/** Every node id in the forest, in pre-order (parent before its children). */
export function collectNodeIds(forest: HierarchyNode[]): string[] {
    const ids: string[] = [];
    const visit = (nodes: HierarchyNode[]): void => {
        for (const node of nodes) {
            ids.push(node.id);
            visit(node.children);
        }
    };
    visit(forest);

    return ids;
}

/** Find a node by id anywhere in the forest, or undefined. */
export function findNodeById(
    forest: HierarchyNode[],
    nodeId: string,
): HierarchyNode | undefined {
    for (const node of forest) {
        if (node.id === nodeId) {
            return node;
        }
        const found = findNodeById(node.children, nodeId);
        if (found) {
            return found;
        }
    }

    return undefined;
}

/**
 * All descendant ids of `nodeId` (its subtree, EXCLUDING the node itself).
 * Returns `[]` when the node is not found or has no children.
 */
export function collectDescendantIds(
    forest: HierarchyNode[],
    nodeId: string,
): string[] {
    const node = findNodeById(forest, nodeId);
    if (!node) {
        return [];
    }

    return collectNodeIds(node.children);
}
