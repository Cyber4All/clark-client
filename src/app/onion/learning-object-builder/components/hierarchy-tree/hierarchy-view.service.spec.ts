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

    describe("unavailableReasons", () => {
        // micro-cia-triad is a MICROMODULE under mod-core-concepts.
        const reasons = (): Record<string, string> =>
            service.unavailableReasons("micro-cia-triad");

        it("gives no reason for valid destinations, the current parent, or the node itself", () => {
            const r = reasons();
            for (const d of service.validDestinations("micro-cia-triad")) {
                expect(r[d.id]).toBeUndefined();
            }
            expect(r["mod-core-concepts"]).toBeUndefined();
            expect(r["micro-cia-triad"]).toBeUndefined();
        });

        it("explains each blocked parent by the first rule it breaks", () => {
            const r = reasons();
            // Its own descendants travel with it.
            expect(r["nano-confidentiality"]).toBe("Moves with CIA Triad");
            // A sibling micromodule is not longer than a micromodule.
            expect(r["micro-threat-models"]).toBe(
                "Must be longer than a micromodule",
            );
            // A nanomodule can never have children.
            expect(r["nano-glossary"]).toBe(
                "Nanomodules can't hold other objects",
            );
            // Read-only wins even when the length would fit (a module).
            expect(r["incident-response"]).toBe(
                "This object is linked and read-only. Objects cannot be moved into linked objects.",
            );
        });

        it("explains inherited destinations and inherited descendants traveling with a linked root", () => {
            const inheritedReason =
                "This object is inherited and read-only. Objects cannot be moved into inherited objects.";
            expect(
                service.unavailableReasons("micro-cia-triad")[
                    "micro-detection"
                ],
            ).toBe(inheritedReason);
            expect(
                service.unavailableReasons("incident-response")[
                    "micro-detection"
                ],
            ).toBe(inheritedReason);
        });

        it("covers every node that is not offered as a destination", () => {
            const offered = new Set(
                service.validDestinations("micro-cia-triad").map((d) => d.id),
            );
            const all: string[] = [];
            const stack = [...service.tree];
            while (stack.length) {
                const n = stack.pop()!;
                all.push(n.id);
                stack.push(...n.children);
            }
            const blocked = all.filter(
                (id) => id !== "micro-cia-triad" && !offered.has(id),
            );
            expect(Object.keys(reasons()).sort()).toEqual(blocked.sort());
        });

        it("explains descendants when the root has no valid destinations", () => {
            expect(service.validDestinations("root")).toEqual([]);
            expect(service.unavailableReasons("root")["unit-foundations"]).toBe(
                "Moves with Intro to Cybersecurity",
            );
        });

        it("returns {} for a node that cannot move", () => {
            expect(service.unavailableReasons("missing")).toEqual({});
            expect(service.unavailableReasons("micro-detection")).toEqual({});
        });
    });
    describe("canAddChild", () => {
        it("is true for an editable node that can hold children", () => {
            expect(service.canAddChild("root")).toBe(true);
            expect(service.canAddChild("micro-cia-triad")).toBe(true);
        });
        it("is false for a Nanomodule, which cannot have children", () => {
            expect(service.canAddChild("nano-glossary")).toBe(false);
        });
        it("is false for a linked root and anything inside it", () => {
            expect(service.canAddChild("incident-response")).toBe(false);
            expect(service.canAddChild("micro-detection")).toBe(false);
        });
        it("is false for an unknown id", () => {
            expect(service.canAddChild("missing")).toBe(false);
        });
    });
    describe("addChild", () => {
        const child = (
            overrides: Partial<Omit<HierarchyNode, "id" | "children">> = {},
        ): Omit<HierarchyNode, "id" | "children"> => ({
            learningObjectId: "new-1",
            cuid: "cuid-1",
            version: 0,
            name: "New child",
            length: LearningObject.Length.MODULE,
            editable: true,
            ...overrides,
        });
        it("appends the child as the last child, keyed by the parent path", () => {
            const added = service.addChild("unit-foundations", child());
            expect(added).toMatchObject({
                id: "unit-foundations/new-1",
                learningObjectId: "new-1",
                cuid: "cuid-1",
                version: 0,
                name: "New child",
                editable: true,
                children: [],
            });
            const kids = find("unit-foundations")!.children;
            expect(kids[kids.length - 1].id).toBe("unit-foundations/new-1");
        });
        it("expands a collapsed parent so the new child is visible", () => {
            service.toggleExpanded("unit-foundations");
            expect(find("unit-foundations")!.expanded).toBe(false);
            service.addChild("unit-foundations", child());
            expect(find("unit-foundations")!.expanded).toBe(true);
        });
        it("leaves the rest of the tree as it was", () => {
            const before = find("mod-cryptography");
            service.addChild("unit-foundations", child());
            expect(find("mod-cryptography")).toEqual(before);
        });
        it("makes the new child movable and a valid parent for shorter objects", () => {
            const added = service.addChild("unit-foundations", child())!;
            expect(service.canMove(added.id)).toBe(true);
            expect(service.canAddChild(added.id)).toBe(true);
        });
        it("refuses an unknown parent", () => {
            const before = service.tree;
            expect(service.addChild("missing", child())).toBeUndefined();
            expect(service.tree).toBe(before);
        });
        it("refuses a read-only parent and one inside a linked subtree", () => {
            expect(
                service.addChild(
                    "incident-response",
                    child({ length: LearningObject.Length.NANOMODULE }),
                ),
            ).toBeUndefined();
            expect(
                service.addChild(
                    "micro-detection",
                    child({ length: LearningObject.Length.NANOMODULE }),
                ),
            ).toBeUndefined();
        });
        it("refuses a Nanomodule parent", () => {
            expect(
                service.addChild(
                    "nano-glossary",
                    child({ length: LearningObject.Length.NANOMODULE }),
                ),
            ).toBeUndefined();
        });
        it("refuses a child that is not strictly shorter than its parent", () => {
            expect(
                service.addChild(
                    "mod-core-concepts",
                    child({ length: LearningObject.Length.MODULE }),
                ),
            ).toBeUndefined();
            expect(
                service.addChild(
                    "mod-core-concepts",
                    child({ length: LearningObject.Length.UNIT }),
                ),
            ).toBeUndefined();
        });
        it("refuses a child with no learning object id", () => {
            expect(
                service.addChild(
                    "unit-foundations",
                    child({ learningObjectId: undefined }),
                ),
            ).toBeUndefined();
        });
        it("refuses a learning object the parent already holds", () => {
            expect(
                service.addChild(
                    "unit-foundations",
                    child({ learningObjectId: "mod-cryptography" }),
                ),
            ).toBeUndefined();
        });
    });
});
