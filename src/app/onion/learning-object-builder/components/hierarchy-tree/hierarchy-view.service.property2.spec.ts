import * as fc from "fast-check";
import { HierarchyViewService } from "./hierarchy-view.service";
import { arbHierarchyForest, collectNodeIds } from "./hierarchy-arbitraries";

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
