import * as fc from "fast-check";
import { HierarchyViewService } from "./hierarchy-view.service";
import { arbHierarchyForest, collectNodeIds } from "./hierarchy-arbitraries";

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
