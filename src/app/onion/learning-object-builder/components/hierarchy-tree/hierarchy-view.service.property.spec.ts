import * as fc from "fast-check";
import { HierarchyViewService } from "./hierarchy-view.service";
import {
    arbHierarchyForest,
    collectDescendantIds,
    collectNodeIds,
} from "./hierarchy-arbitraries";

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
