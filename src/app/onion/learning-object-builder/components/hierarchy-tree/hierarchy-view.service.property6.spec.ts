import * as fc from "fast-check";
import { HierarchyViewService } from "./hierarchy-view.service";
import {
    arbHierarchyForest,
    collectNodeIds,
    collectDescendantIds,
    findNodeById,
} from "./hierarchy-arbitraries";
import { HierarchyNode } from "./hierarchy-tree.types";

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
