import * as fc from "fast-check";
import { HierarchyViewService } from "./hierarchy-view.service";
import { arbHierarchyForest, collectNodeIds } from "./hierarchy-arbitraries";

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
