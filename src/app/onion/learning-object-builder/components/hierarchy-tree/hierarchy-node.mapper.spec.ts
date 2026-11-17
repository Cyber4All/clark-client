import { LearningObject } from "@entity";
import {
    builderIdentity,
    canViewerEdit,
    toHierarchyNode,
} from "./hierarchy-node.mapper";
import { HierarchyViewer } from "./hierarchy-tree.types";

const payload = (overrides: Record<string, unknown> = {}): LearningObject =>
    ({
        id: "c1",
        name: "Child",
        length: LearningObject.Length.MODULE,
        status: LearningObject.Status.UNRELEASED,
        author: { username: "alice" },
        contributors: [{ username: "bob" }],
        ...overrides,
    }) as unknown as LearningObject;

const viewer = (overrides: Partial<HierarchyViewer> = {}): HierarchyViewer => ({
    username: "carol",
    isAdminOrEditor: false,
    ...overrides,
});

describe("hierarchy-node.mapper", () => {
    describe("canViewerEdit", () => {
        it("allows the author", () => {
            expect(
                canViewerEdit(payload(), viewer({ username: "alice" })),
            ).toBe(true);
        });

        it("allows a contributor", () => {
            expect(canViewerEdit(payload(), viewer({ username: "bob" }))).toBe(
                true,
            );
        });

        it("allows an admin or editor", () => {
            expect(
                canViewerEdit(payload(), viewer({ isAdminOrEditor: true })),
            ).toBe(true);
        });

        it("rejects anyone else", () => {
            expect(canViewerEdit(payload(), viewer())).toBe(false);
        });

        it("rejects when there is no signed-in user", () => {
            expect(
                canViewerEdit(payload(), viewer({ username: undefined })),
            ).toBe(false);
        });
    });

    describe("toHierarchyNode", () => {
        it("maps an editable child", () => {
            expect(
                toHierarchyNode(payload(), viewer({ username: "alice" })),
            ).toEqual({
                id: "c1",
                learningObjectId: "c1",
                name: "Child",
                length: LearningObject.Length.MODULE,
                editable: true,
                children: [],
            });
        });

        it("maps a child the viewer cannot edit to a linked root", () => {
            const node = toHierarchyNode(payload(), viewer());
            expect(node.editable).toBe(false);
            expect(node.linkedRoot).toBe(true);
        });

        it("keeps descendants of a read-only node fully immutable", () => {
            const node = toHierarchyNode(
                payload(),
                viewer({ username: "alice" }),
                true,
            );
            expect(node.editable).toBe(false);
            expect(node.linkedRoot).toBeUndefined();
        });

        it("uses the occurrence key as id and keeps the learning object id", () => {
            const node = toHierarchyNode(
                payload(),
                viewer({ username: "alice" }),
                false,
                "root/u1/c1",
            );
            expect(node.id).toBe("root/u1/c1");
            expect(node.learningObjectId).toBe("c1");
        });

        it("applies the occurrence key to read-only descendants too", () => {
            const node = toHierarchyNode(
                payload(),
                viewer({ username: "alice" }),
                true,
                "root/u9/c1",
            );
            expect(node.id).toBe("root/u9/c1");
            expect(node.learningObjectId).toBe("c1");
        });
    });
    describe("builderIdentity", () => {
        it("returns the cuid and version", () => {
            expect(
                builderIdentity({ cuid: "c-1", version: 3 } as LearningObject),
            ).toEqual({ cuid: "c-1", version: 3 });
        });
        it("keeps version 0, which is a real version", () => {
            expect(
                builderIdentity({ cuid: "c-1", version: 0 } as LearningObject),
            ).toEqual({ cuid: "c-1", version: 0 });
        });
        it("leaves out an empty cuid and a missing version", () => {
            const identity = builderIdentity({
                cuid: "",
                version: undefined,
            } as unknown as LearningObject);
            expect(identity).toEqual({});
            expect("cuid" in identity).toBe(false);
            expect("version" in identity).toBe(false);
        });
    });
    describe("toHierarchyNode Builder address", () => {
        it("carries cuid and version on an editable child", () => {
            const node = toHierarchyNode(
                payload({ cuid: "c-1", version: 2 }),
                viewer({ username: "alice" }),
            );
            expect(node).toMatchObject({ cuid: "c-1", version: 2 });
        });
        it("carries them on a read-only descendant too", () => {
            const node = toHierarchyNode(
                payload({ cuid: "c-1", version: 2 }),
                viewer({ username: "alice" }),
                true,
            );
            expect(node).toMatchObject({ cuid: "c-1", version: 2 });
        });
        it("adds no keys when the payload has neither", () => {
            const node = toHierarchyNode(
                payload(),
                viewer({ username: "alice" }),
            );
            expect("cuid" in node).toBe(false);
            expect("version" in node).toBe(false);
        });
    });
});
