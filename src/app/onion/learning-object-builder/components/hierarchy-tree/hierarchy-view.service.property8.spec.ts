import * as fc from "fast-check";
import { HierarchyViewService } from "./hierarchy-view.service";
import { HierarchyNode } from "./hierarchy-tree.types";
import {
    arbHierarchyForest,
    collectNodeIds,
    findNodeById,
} from "./hierarchy-arbitraries";

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
