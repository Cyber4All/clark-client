import { LearningObject } from "@entity";
import { HierarchyViewService } from "./hierarchy-view.service";
import { HierarchyNode } from "./hierarchy-tree.types";

const { COURSE, UNIT, MODULE, MICROMODULE } = LearningObject.Length;

/**
 * Occurrence identity: a learning object (`m1`) shared by two parents appears
 * twice, with distinct node ids and the same `learningObjectId`. Actions must
 * target the occurrence they name, never every occurrence of the object.
 *
 *   root
 *   |- u1 -> m1 (root/u1/m1) -> micro1
 *   |- u2 -> m1 (root/u2/m1) -> micro1
 *   `- u3 (empty unit)
 */
function sharedTree(): HierarchyNode[] {
    const occurrence = (parentKey: string): HierarchyNode => ({
        id: `${parentKey}/m1`,
        learningObjectId: "m1",
        name: "Shared Module",
        length: MODULE,
        editable: true,
        children: [
            {
                id: `${parentKey}/m1/micro1`,
                learningObjectId: "micro1",
                name: "Micro",
                length: MICROMODULE,
                editable: true,
                children: [],
            },
        ],
    });
    const unit = (id: string, kids: HierarchyNode[]): HierarchyNode => ({
        id: `root/${id}`,
        learningObjectId: id,
        name: id,
        length: UNIT,
        editable: true,
        expanded: true,
        children: kids,
    });

    return [
        {
            id: "root",
            learningObjectId: "root",
            name: "Root",
            length: COURSE,
            editable: true,
            expanded: true,
            children: [
                unit("u1", [occurrence("root/u1")]),
                unit("u2", [occurrence("root/u2")]),
                unit("u3", []),
            ],
        },
    ];
}

function find(nodes: HierarchyNode[], id: string): HierarchyNode | undefined {
    for (const node of nodes) {
        if (node.id === id) {
            return node;
        }
        const found = find(node.children, id);
        if (found) {
            return found;
        }
    }

    return undefined;
}

describe("HierarchyViewService - shared child occurrences", () => {
    let service: HierarchyViewService;

    beforeEach(() => {
        service = new HierarchyViewService();
        service.setTree(sharedTree());
    });

    it("toggles only the occurrence that was named", () => {
        service.toggleExpanded("root/u1/m1");

        expect(find(service.tree, "root/u1/m1")!.expanded).toBe(true);
        expect(find(service.tree, "root/u2/m1")!.expanded).toBeFalsy();
    });

    it("moves only the named occurrence and leaves the other in place", () => {
        expect(service.moveNode("root/u1/m1", "root/u3")).toBe(true);

        const u1 = find(service.tree, "root/u1")!;
        const u2 = find(service.tree, "root/u2")!;
        const u3 = find(service.tree, "root/u3")!;
        expect(u1.children).toEqual([]);
        expect(u2.children.map((c) => c.id)).toEqual(["root/u2/m1"]);
        expect(u3.children.map((c) => c.id)).toEqual(["root/u1/m1"]);
        // The moved occurrence carries its own subtree; the other keeps its own.
        expect(u3.children[0].children.map((c) => c.id)).toEqual([
            "root/u1/m1/micro1",
        ]);
        expect(u2.children[0].children.map((c) => c.id)).toEqual([
            "root/u2/m1/micro1",
        ]);
    });

    it("reports the parent of the named occurrence", () => {
        expect(service.parentIdOf("root/u1/m1")).toBe("root/u1");
        expect(service.parentIdOf("root/u2/m1")).toBe("root/u2");
    });

    it("rejects moving an occurrence under a parent that already holds the same learning object", () => {
        // u2 already contains m1, so root/u1/m1 cannot also go under u2.
        expect(
            service.canDrop(
                find(service.tree, "root/u1/m1")!,
                find(service.tree, "root/u2")!,
            ),
        ).toBe(false);
        expect(service.moveNode("root/u1/m1", "root/u2")).toBe(false);
        expect(find(service.tree, "root/u1")!.children).toHaveLength(1);
        expect(find(service.tree, "root/u2")!.children).toHaveLength(1);
    });

    it("does not offer a parent that already holds the learning object as a destination", () => {
        const ids = service.validDestinations("root/u1/m1").map((d) => d.id);

        expect(ids).not.toContain("root/u2");
        expect(ids).toContain("root/u3");
        // Its current parent stays available (reorder).
        expect(ids).toContain("root/u1");
    });

    it("allows the move once the other occurrence is gone from the target", () => {
        service.moveNode("root/u2/m1", "root/u3");

        expect(
            service.canDrop(
                find(service.tree, "root/u1/m1")!,
                find(service.tree, "root/u2")!,
            ),
        ).toBe(true);
    });
});
