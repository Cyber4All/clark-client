import * as fc from "fast-check";
import { HierarchyViewService } from "./hierarchy-view.service";
import { HierarchyNode } from "./hierarchy-tree.types";
import {
    arbHierarchyForest,
    collectNodeIds,
    findNodeById,
} from "./hierarchy-arbitraries";

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
