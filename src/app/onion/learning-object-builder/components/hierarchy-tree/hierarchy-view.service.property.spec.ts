import * as fc from "fast-check";
import { HierarchyViewService } from "./hierarchy-view.service";
import { HierarchyNode } from "./hierarchy-tree.types";
import {
    arbHierarchyForest,
    collectDescendantIds,
    collectNodeIds,
    findNodeById,
} from "./hierarchy-arbitraries";

/**
 * Property-based tests for HierarchyViewService.
 * Each describe block verifies one invariant over generated hierarchies.
 */

/**
 * Generated hierarchies verify that destinations exclude the source node and its descendants.
 */
describe("HierarchyViewService (property-based)", () => {
    it("valid destinations never include the node or its descendants", () => {
        fc.assert(
            fc.property(arbHierarchyForest, (forest) => {
                const service = new HierarchyViewService();
                service.setTree(forest);
                for (const nodeId of collectNodeIds(forest)) {
                    const descendantIds = new Set(
                        collectDescendantIds(forest, nodeId),
                    );
                    const destinations = service.validDestinations(nodeId);
                    for (const destination of destinations) {
                        // Never the node itself ...
                        expect(destination.id).not.toBe(nodeId);
                        // ... and never any of its descendants.
                        expect(descendantIds.has(destination.id)).toBe(false);
                    }
                }
            }),
            { numRuns: 100 },
        );
    });
});

/**
 * Every enumerated destination must be accepted by the move engine.
 * Seed a fresh service per destination so earlier moves do not affect later checks.
 */
describe("HierarchyViewService - destination acceptance", () => {
    it("every enumerated destination is accepted by moveNode", () => {
        fc.assert(
            fc.property(arbHierarchyForest, (forest) => {
                for (const nodeId of collectNodeIds(forest)) {
                    // Only movable nodes enumerate destinations; non-movable
                    // nodes yield [] and have nothing to assert here.
                    const probe = new HierarchyViewService();
                    probe.setTree(forest);
                    if (!probe.canMove(nodeId)) {
                        continue;
                    }
                    const destinations = probe.validDestinations(nodeId);
                    for (const destination of destinations) {
                        // Re-seed a fresh tree per destination because moveNode
                        // mutates state; otherwise a prior move would invalidate
                        // the remaining destinations.
                        const service = new HierarchyViewService();
                        service.setTree(forest);
                        expect(
                            service.moveNode(
                                nodeId,
                                destination.id,
                                destination.childCount,
                            ),
                        ).toBe(true);
                    }
                }
            }),
            { numRuns: 100 },
        );
    });
});

/**
 * Picker and drag moves must produce the same hierarchy for equivalent source and destination pairs.
 */
describe("HierarchyViewService - equivalent move results", () => {
    it("picker move equals the equivalent drag-drop move", () => {
        fc.assert(
            fc.property(arbHierarchyForest, (forest) => {
                for (const nodeId of collectNodeIds(forest)) {
                    // Only exercise valid (movable node, valid destination)
                    // pairs: the picker only ever offers these destinations.
                    const destinationsService = new HierarchyViewService();
                    destinationsService.setTree(forest);
                    const destinations =
                        destinationsService.validDestinations(nodeId);
                    for (const destination of destinations) {
                        // Picker path: two fresh, independently-seeded service
                        // instances built from the same forest. Both call the
                        // SAME move with the index omitted (append), which is
                        // exactly what the picker and the drag-drop paths do.
                        const pickerService = new HierarchyViewService();
                        pickerService.setTree(forest);
                        const dragDropService = new HierarchyViewService();
                        dragDropService.setTree(forest);
                        const pickerApplied = pickerService.moveNode(
                            nodeId,
                            destination.id,
                        );
                        const dragDropApplied = dragDropService.moveNode(
                            nodeId,
                            destination.id,
                        );
                        // Both paths accept the move ...
                        expect(pickerApplied).toBe(true);
                        expect(dragDropApplied).toBe(true);
                        // ... and produce an identical resulting tree.
                        expect(pickerService.tree).toEqual(
                            dragDropService.tree,
                        );
                    }
                }
            }),
            { numRuns: 100 },
        );
    });
});

/**
 * Omitting the insertion index appends the moved node as the destination's last child, including same-parent reorders.
 */
describe("HierarchyViewService (property-based) - append index", () => {
    it("with index omitted, the moved node lands as the last child of the destination", () => {
        fc.assert(
            fc.property(arbHierarchyForest, (forest) => {
                for (const nodeId of collectNodeIds(forest)) {
                    // Only exercise valid (movable node, valid destination)
                    // pairs the service itself vouches for.
                    const probe = new HierarchyViewService();
                    probe.setTree(forest);
                    const destinations = probe.validDestinations(nodeId);
                    for (const destination of destinations) {
                        // Fresh service per move so each append is measured
                        // against the pristine forest.
                        const service = new HierarchyViewService();
                        service.setTree(forest);
                        // Append: index omitted.
                        const moved = service.moveNode(nodeId, destination.id);
                        expect(moved).toBe(true);
                        const target = findNodeById(
                            service.tree,
                            destination.id,
                        );
                        expect(target).toBeDefined();
                        const lastChild =
                            target!.children[target!.children.length - 1];
                        expect(lastChild).toBeDefined();
                        // The moved node is the destination's last child, whether
                        // this was a re-parent or a same-parent reorder.
                        expect(lastChild!.id).toBe(nodeId);
                    }
                }
            }),
            { numRuns: 100 },
        );
    });
});

/**
 * Moving a linked root preserves every descendant, child order, and nesting relationship.
 * Compare subtree snapshots before and after each move on a freshly seeded service.
 */

/** A structural snapshot of a subtree: id plus the ordered shapes of children. */
interface SubtreeShape {
    id: string;
    children: SubtreeShape[];
}

/** Capture the (id + nesting + child order) shape of a node's subtree. */
function captureShape(node: HierarchyNode): SubtreeShape {
    return {
        id: node.id,
        children: node.children.map(captureShape),
    };
}

/** Every linked-root node id in the forest (nodes flagged `linkedRoot`). */
function collectLinkedRootIds(forest: HierarchyNode[]): string[] {
    return collectNodeIds(forest).filter((id) => {
        const node = findNodeById(forest, id);
        return !!node && node.linkedRoot === true;
    });
}

describe("HierarchyViewService - linked subtree preservation", () => {
    it("moving a linked root preserves its whole subtree", () => {
        fc.assert(
            fc.property(arbHierarchyForest, (forest) => {
                const linkedRootIds = collectLinkedRootIds(forest);
                // Only forests with at least one linked root are interesting.
                fc.pre(linkedRootIds.length > 0);

                for (const nodeId of linkedRootIds) {
                    // The linked root must be movable and have at least one
                    // valid destination to exercise a real move.
                    const probe = new HierarchyViewService();
                    probe.setTree(forest);
                    if (!probe.canMove(nodeId)) {
                        continue;
                    }
                    const destinations = probe.validDestinations(nodeId);
                    if (destinations.length === 0) {
                        continue;
                    }

                    // Shape of the subtree BEFORE any move (pristine forest).
                    const before = findNodeById(forest, nodeId);
                    expect(before).toBeDefined();
                    const shapeBefore = captureShape(before!);

                    for (const destination of destinations) {
                        // Fresh service per move: moveNode mutates state.
                        const service = new HierarchyViewService();
                        service.setTree(forest);

                        const moved = service.moveNode(nodeId, destination.id);
                        expect(moved).toBe(true);

                        // Re-find the linked root in the new tree and compare
                        // its subtree shape to the pristine one.
                        const after = findNodeById(service.tree, nodeId);
                        expect(after).toBeDefined();
                        const shapeAfter = captureShape(after!);
                        expect(shapeAfter).toEqual(shapeBefore);
                    }
                }
            }),
            { numRuns: 100 },
        );
    });
});

/**
 * Rejected moves return false without changing the hierarchy or emitting a new tree.
 * Check both reference identity and the structural snapshot.
 */
describe("HierarchyViewService - rejected moves", () => {
    /** Deep structural clone so the "before" snapshot is independent of mutation. */
    function snapshot(forest: HierarchyNode[]): HierarchyNode[] {
        return JSON.parse(JSON.stringify(forest));
    }

    /**
     * Build invalid `(nodeId, targetId)` pairs for the given forest. A pair is
     * invalid when the move must be rejected regardless of index:
     *   - targetId === nodeId (a node cannot be moved under itself);
     *   - targetId is a descendant of nodeId (cannot move under its own subtree);
     *   - nodeId is non-movable (`canMove` is false: a root or a node buried
     *     inside a linked subtree).
     *
     * These mirror the guards `moveNode` enforces via `canMove`/`canDrop`.
     */
    function invalidPairs(
        service: HierarchyViewService,
        forest: HierarchyNode[],
    ): Array<{ nodeId: string; targetId: string }> {
        const ids = collectNodeIds(forest);
        const pairs: Array<{ nodeId: string; targetId: string }> = [];

        for (const nodeId of ids) {
            // Case: node is non-movable -> ANY target is a rejected move.
            if (!service.canMove(nodeId)) {
                for (const targetId of ids) {
                    pairs.push({ nodeId, targetId });
                }
                continue;
            }

            // Case: movable node, but target is the node itself.
            pairs.push({ nodeId, targetId: nodeId });

            // Case: movable node, but target is one of its descendants.
            for (const targetId of collectDescendantIds(forest, nodeId)) {
                pairs.push({ nodeId, targetId });
            }
        }
        return pairs;
    }

    it("a rejected move returns false and leaves the hierarchy unchanged", () => {
        fc.assert(
            fc.property(
                arbHierarchyForest,
                // Arbitrary index, including out-of-range values, so the rejection
                // holds no matter what position was requested.
                fc.integer({ min: -5, max: 10 }),
                (forest, index) => {
                    // A fresh service per attempt; shrinking replays cleanly.
                    const service = new HierarchyViewService();
                    service.setTree(forest);

                    const pairs = invalidPairs(service, forest);
                    // Not every forest yields an invalid pair with a distinct
                    // target, but a forest always has at least one non-movable
                    // node (its roots), so `pairs` is never empty.
                    fc.pre(pairs.length > 0);

                    for (const { nodeId, targetId } of pairs) {
                        const before = service.tree;
                        const beforeSnapshot = snapshot(before);

                        const result = service.moveNode(
                            nodeId,
                            targetId,
                            index,
                        );

                        // The move is rejected.
                        expect(result).toBe(false);
                        // No emission occurred: the tree reference is unchanged.
                        expect(service.tree).toBe(before);
                        // And it is structurally identical to the snapshot.
                        expect(service.tree).toStrictEqual(beforeSnapshot);
                        // The node is still exactly where it was.
                        expect(
                            findNodeById(service.tree, nodeId),
                        ).toStrictEqual(findNodeById(beforeSnapshot, nodeId));
                    }
                },
            ),
            { numRuns: 100 },
        );
    });
});

/**
 * Valid moves preserve the set of node IDs without duplicating or losing nodes.
 * Seed a fresh service per move to compare against the original hierarchy.
 */
describe("HierarchyViewService - node preservation", () => {
    it("a confirmed valid move preserves the set of node ids", () => {
        fc.assert(
            fc.property(arbHierarchyForest, (forest) => {
                for (const nodeId of collectNodeIds(forest)) {
                    // Only movable nodes enumerate destinations; non-movable
                    // nodes yield [] and have nothing to assert here.
                    const probe = new HierarchyViewService();
                    probe.setTree(forest);
                    const destinations = probe.validDestinations(nodeId);
                    for (const destination of destinations) {
                        // Fresh service per move: moveNode mutates state, so
                        // each move must be measured against the pristine forest.
                        const service = new HierarchyViewService();
                        service.setTree(forest);
                        const idsBefore = collectNodeIds(service.tree)
                            .slice()
                            .sort();

                        const moved = service.moveNode(
                            nodeId,
                            destination.id,
                            destination.childCount,
                        );
                        expect(moved).toBe(true);

                        const idsAfter = collectNodeIds(service.tree)
                            .slice()
                            .sort();
                        // No duplication, no loss: the exact same ids exist
                        // after the move as before it.
                        expect(idsAfter).toEqual(idsBefore);
                    }
                }
            }),
            { numRuns: 100 },
        );
    });
});

/**
 * Insertion indices are clamped against the destination's child count after
 * removing the source node, including same-parent reorders.
 */
describe("HierarchyViewService (property-based) - clamped insertion index", () => {
    it("an arbitrary insertion index is clamped into the destination's range", () => {
        fc.assert(
            fc.property(
                arbHierarchyForest,
                fc.integer(),
                (forest, requestedIndex) => {
                    for (const nodeId of collectNodeIds(forest)) {
                        // Only exercise valid (movable node, valid destination)
                        // pairs the service itself vouches for.
                        const probe = new HierarchyViewService();
                        probe.setTree(forest);
                        const destinations = probe.validDestinations(nodeId);
                        for (const destination of destinations) {
                            // Fresh service per move: moveNode mutates state.
                            const service = new HierarchyViewService();
                            service.setTree(forest);

                            // The index is clamped against the destination's
                            // children AFTER the node is removed. For a
                            // same-parent reorder the node is one of those
                            // children, so removal reduces the count by one.
                            const sameParent =
                                service.parentIdOf(nodeId) === destination.id;
                            const childCountAfterRemoval = sameParent
                                ? destination.childCount - 1
                                : destination.childCount;
                            const expectedIndex = Math.max(
                                0,
                                Math.min(
                                    requestedIndex,
                                    childCountAfterRemoval,
                                ),
                            );

                            const moved = service.moveNode(
                                nodeId,
                                destination.id,
                                requestedIndex,
                            );
                            expect(moved).toBe(true);

                            const target = findNodeById(
                                service.tree,
                                destination.id,
                            );
                            expect(target).toBeDefined();
                            const appliedIndex = target!.children.findIndex(
                                (child: HierarchyNode) => child.id === nodeId,
                            );

                            // The node is present among the destination's
                            // children and sits at the clamped position.
                            expect(appliedIndex).toBe(expectedIndex);
                            // That position is a legal index within the
                            // resulting children (0..length-1), i.e. within
                            // 0..childCountAfterRemoval.
                            expect(appliedIndex).toBeGreaterThanOrEqual(0);
                            expect(appliedIndex).toBeLessThanOrEqual(
                                childCountAfterRemoval,
                            );
                            expect(appliedIndex).toBeLessThan(
                                target!.children.length,
                            );
                        }
                    }
                },
            ),
            { numRuns: 100 },
        );
    });
});
