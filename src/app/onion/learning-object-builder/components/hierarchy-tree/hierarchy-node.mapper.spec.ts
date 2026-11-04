import { LearningObject } from "@entity";
import { HierarchyChildPayload } from "../../../../core/learning-object-module/hierarchy/hierarchy.types";
import { canViewerEdit, toHierarchyNode } from "./hierarchy-node.mapper";
import { HierarchyViewer } from "./hierarchy-tree.types";

const payload = (
    overrides: Partial<HierarchyChildPayload> = {},
): HierarchyChildPayload => ({
    id: "c1",
    name: "Child",
    length: LearningObject.Length.MODULE,
    status: LearningObject.Status.UNRELEASED,
    author: { username: "alice" },
    contributors: [{ username: "bob" }],
    ...overrides,
});

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
    });
});
