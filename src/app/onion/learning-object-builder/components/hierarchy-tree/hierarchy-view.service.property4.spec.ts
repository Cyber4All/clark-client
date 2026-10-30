import * as fc from "fast-check";
import { HierarchyViewService } from "./hierarchy-view.service";
import {
    arbHierarchyForest,
    collectNodeIds,
    findNodeById,
} from "./hierarchy-arbitraries";

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
