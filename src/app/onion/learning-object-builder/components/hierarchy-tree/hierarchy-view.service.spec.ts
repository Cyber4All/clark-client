import { LearningObject } from "@entity";
import { HierarchyViewService } from "./hierarchy-view.service";
import { HierarchyNode } from "./hierarchy-tree.types";
import { buildHierarchyTestFixture } from "./hierarchy-test-data";

/**
 * Example-based unit tests for `HierarchyViewService`
 *
 * These pin the concrete, human-readable edge cases of `validDestinations` and
 * `moveNode` against a dedicated hierarchy fixture, using its known node IDs. They complement (and coexist with) the fast-check
 * property specs in `hierarchy-view.service.property*.spec.ts`: the property
 * specs assert universal invariants over arbitrary forests; these specs lock
 * down specific, readable behaviours and index-clamping corners.
 */
describe("HierarchyViewService (example-based)", () => {
    let service: HierarchyViewService;

    beforeEach(() => {
        service = new HierarchyViewService();
        service.setTree(buildHierarchyTestFixture());
    });

    /** Find a node by id anywhere in the current tree (test helper). */
    function find(id: string): HierarchyNode | undefined {
        const stack = [...service.tree];
        while (stack.length) {
            const node = stack.pop()!;
            if (node.id === id) {
                return node;
            }
            stack.push(...node.children);
        }

        return undefined;
    }

    describe("validDestinations - movable editable node", () => {
        // micro-cia-triad is a MICROMODULE, editable, movable. Its current
        // parent is mod-core-concepts (a MODULE); its descendants are the three
        // nano-* leaves.
        it("excludes itself and all its descendants", () => {
            const destinations = service.validDestinations("micro-cia-triad");
            const ids = destinations.map((d) => d.id);

            expect(ids).not.toContain("micro-cia-triad");
            expect(ids).not.toContain("nano-confidentiality");
            expect(ids).not.toContain("nano-integrity");
            expect(ids).not.toContain("nano-availability");
        });

        it("includes exactly the editable parents strictly longer than the node", () => {
            const ids = service
                .validDestinations("micro-cia-triad")
                .map((d) => d.id)
                .sort();

            // COURSE/UNIT/MODULE editable ancestors + the other MODULE sibling
            // parent. The linked-root MODULE "incident-response" is NOT editable
            // so canDrop rejects it; micromodule/nano nodes are not longer than
            // a micromodule so they are excluded too.
            expect(ids).toEqual(
                [
                    "root",
                    "unit-foundations",
                    "mod-core-concepts",
                    "mod-cryptography",
                ].sort(),
            );
        });

        it("marks the current parent as isCurrentParent with childCount including the node", () => {
            const destinations = service.validDestinations("micro-cia-triad");
            const currentParent = destinations.find(
                (d) => d.id === "mod-core-concepts",
            );

            expect(currentParent).toBeDefined();
            expect(currentParent!.isCurrentParent).toBe(true);
            // mod-core-concepts has two children (micro-cia-triad itself +
            // micro-threat-models); childCount counts siblings INCLUDING the node.
            expect(currentParent!.childCount).toBe(2);
            expect(find("mod-core-concepts")!.children.length).toBe(2);
        });

        it("marks re-parent destinations as not the current parent", () => {
            const destinations = service.validDestinations("micro-cia-triad");
            const reParent = destinations.find(
                (d) => d.id === "mod-cryptography",
            );

            expect(reParent).toBeDefined();
            expect(reParent!.isCurrentParent).toBe(false);
            // childCount is the candidate's own current children.length (the
            // append index): mod-cryptography has two micromodule children.
            expect(reParent!.childCount).toBe(2);
        });
    });

    describe("validDestinations - non-movable / empty results", () => {
        it("returns [] for the root learning object", () => {
            expect(service.validDestinations("root")).toEqual([]);
        });

        it("returns [] for a linked-subtree descendant (micro-detection)", () => {
            // Inside the linked subtree rooted at incident-response: canMove is
            // false, so there are no destinations.
            expect(service.canMove("micro-detection")).toBe(false);
            expect(service.validDestinations("micro-detection")).toEqual([]);
        });

        it("returns [] for a deeper linked-subtree descendant (nano-siem)", () => {
            expect(service.canMove("nano-siem")).toBe(false);
            expect(service.validDestinations("nano-siem")).toEqual([]);
        });

        it("returns [] for an unknown id", () => {
            expect(service.validDestinations("does-not-exist")).toEqual([]);
        });
    });

    describe("validDestinations - linked root is movable", () => {
        // incident-response is read-only (editable:false) but linkedRoot:true,
        // so it can be MOVED as a whole unit. It is a MODULE, so its valid
        // parents are the editable COURSE/UNIT nodes.
        it("returns valid parents for the linked root (it is movable)", () => {
            expect(service.canMove("incident-response")).toBe(true);

            const ids = service
                .validDestinations("incident-response")
                .map((d) => d.id)
                .sort();

            expect(ids).toEqual(["root", "unit-foundations"].sort());
        });

        it("marks root as the linked root's current parent", () => {
            const destinations = service.validDestinations("incident-response");
            const currentParent = destinations.find((d) => d.id === "root");

            expect(currentParent).toBeDefined();
            expect(currentParent!.isCurrentParent).toBe(true);
        });
    });

    describe("moveNode - same-parent reorder vs re-parent", () => {
        it("reorders within the same parent (a move canDrop would reject as a re-parent)", () => {
            // micro-cia-triad is currently index 0 under mod-core-concepts.
            // Move it to index 1 (same parent) -> it becomes the last child.
            const applied = service.moveNode(
                "micro-cia-triad",
                "mod-core-concepts",
                1,
            );

            expect(applied).toBe(true);
            const childIds = find("mod-core-concepts")!.children.map(
                (c) => c.id,
            );
            expect(childIds).toEqual([
                "micro-threat-models",
                "micro-cia-triad",
            ]);
        });

        it("re-parents a node under a different valid parent", () => {
            const applied = service.moveNode(
                "micro-cia-triad",
                "mod-cryptography",
            );

            expect(applied).toBe(true);
            // Removed from old parent ...
            const oldChildIds = find("mod-core-concepts")!.children.map(
                (c) => c.id,
            );
            expect(oldChildIds).not.toContain("micro-cia-triad");
            // ... appended as the last child of the new parent.
            const newChildIds = find("mod-cryptography")!.children.map(
                (c) => c.id,
            );
            expect(newChildIds[newChildIds.length - 1]).toBe("micro-cia-triad");
        });

        it("rejects a re-parent onto an invalid target (linked-subtree member)", () => {
            const before = service.tree;
            const applied = service.moveNode(
                "micro-cia-triad",
                "micro-detection",
            );

            expect(applied).toBe(false);
            // Tree reference is unchanged on a rejected move.
            expect(service.tree).toBe(before);
        });
    });

    describe("moveNode - index clamping", () => {
        // Re-parent micro-cia-triad under mod-cryptography, which already has
        // two children (micro-symmetric, micro-asymmetric). After the node is
        // removed from its old parent, the target still has 2 children, so the
        // valid insertion range is 0..2 inclusive.

        it("inserts at index 0 (front) when index === 0", () => {
            service.moveNode("micro-cia-triad", "mod-cryptography", 0);
            const ids = find("mod-cryptography")!.children.map((c) => c.id);

            expect(ids).toEqual([
                "micro-cia-triad",
                "micro-symmetric",
                "micro-asymmetric",
            ]);
        });

        it("appends when index === childCount (2)", () => {
            service.moveNode("micro-cia-triad", "mod-cryptography", 2);
            const ids = find("mod-cryptography")!.children.map((c) => c.id);

            expect(ids).toEqual([
                "micro-symmetric",
                "micro-asymmetric",
                "micro-cia-triad",
            ]);
        });

        it("clamps a large out-of-range index (999) down to the end", () => {
            service.moveNode("micro-cia-triad", "mod-cryptography", 999);
            const ids = find("mod-cryptography")!.children.map((c) => c.id);

            expect(ids[ids.length - 1]).toBe("micro-cia-triad");
            expect(ids.length).toBe(3);
        });

        it("clamps a negative out-of-range index (-5) up to the front", () => {
            service.moveNode("micro-cia-triad", "mod-cryptography", -5);
            const ids = find("mod-cryptography")!.children.map((c) => c.id);

            expect(ids[0]).toBe("micro-cia-triad");
            expect(ids.length).toBe(3);
        });

        it("clamps against children AFTER removal for a same-parent reorder", () => {
            // mod-core-concepts has 2 children. Removing micro-cia-triad leaves
            // 1, so the valid range is 0..1; index 999 clamps to append (index 1).
            service.moveNode("micro-cia-triad", "mod-core-concepts", 999);
            const ids = find("mod-core-concepts")!.children.map((c) => c.id);

            expect(ids).toEqual(["micro-threat-models", "micro-cia-triad"]);
        });
    });
});
