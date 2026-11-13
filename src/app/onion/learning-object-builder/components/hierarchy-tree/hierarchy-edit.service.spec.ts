import { LearningObject } from "@entity";
import {
    HierarchyCreateOutcome,
    HierarchyEditError,
    HierarchyEditOutcome,
    HierarchyEditService,
} from "./hierarchy-edit.service";
import { HierarchyViewService } from "./hierarchy-view.service";
import { HierarchyNode } from "./hierarchy-tree.types";

// The real service imports via the bare "app/..." path, which this repo's Jest
// config cannot resolve. Only the DI token is needed here.
jest.mock(
    "../../../../core/learning-object-module/learning-object/learning-object.service",
    () => ({ LearningObjectService: class LearningObjectService {} }),
);

const { COURSE, UNIT, MODULE, MICROMODULE } = LearningObject.Length;

const node = (
    id: string,
    length: LearningObject.Length,
    over: Partial<HierarchyNode> = {},
): HierarchyNode => ({
    id,
    learningObjectId: id,
    name: `name-${id}`,
    length,
    editable: true,
    expanded: true,
    children: [],
    ...over,
});

/** root(course) > [u1(unit) > [m1(module)], u2(unit), linked(unit, linkedRoot) > [lm(module)]] */
const buildTree = (): HierarchyNode[] => [
    node("root", COURSE, {
        children: [
            node("u1", UNIT, {
                id: "root/u1",
                learningObjectId: "u1",
                children: [
                    node("m1", MODULE, {
                        id: "root/u1/m1",
                        learningObjectId: "m1",
                    }),
                ],
            }),
            node("u2", UNIT, { id: "root/u2", learningObjectId: "u2" }),
            node("linked", UNIT, {
                id: "root/linked",
                learningObjectId: "linked",
                editable: false,
                linkedRoot: true,
                children: [
                    node("lm", MODULE, {
                        id: "root/linked/lm",
                        learningObjectId: "lm",
                        editable: false,
                    }),
                ],
            }),
        ],
    }),
];

/** Let pending promise callbacks (and the rxjs they feed) run. */
const settle = (): Promise<void> => new Promise((r) => setTimeout(r, 0));

describe("HierarchyEditService", () => {
    let view: HierarchyViewService;
    let service: HierarchyEditService;
    let setChildren: jest.Mock;

    const idsUnder = (id: string): string[] =>
        (find(view.tree, id)?.children ?? []).map((c) => c.id);

    /** Run an edit to completion and capture how it ended. */
    async function run(
        edit$: ReturnType<HierarchyEditService["remove"]>,
    ): Promise<{
        outcome?: HierarchyEditOutcome;
        error?: HierarchyEditError;
    }> {
        const result: {
            outcome?: HierarchyEditOutcome;
            error?: HierarchyEditError;
        } = {};
        edit$.subscribe({
            next: (outcome) => (result.outcome = outcome),
            error: (error) => (result.error = error),
        });
        await settle();

        return result;
    }

    beforeEach(() => {
        setChildren = jest.fn().mockResolvedValue(undefined);
        view = new HierarchyViewService();
        view.setTree(buildTree());
        service = new HierarchyEditService({ setChildren } as any, view);
    });

    describe("remove", () => {
        it("unlinks the child from the parent by learning object id and drops the node", async () => {
            const { outcome, error } = await run(service.remove("root/u1/m1"));

            expect(error).toBeUndefined();
            expect(setChildren).toHaveBeenCalledTimes(1);
            expect(setChildren).toHaveBeenCalledWith("u1", ["m1"], true);
            expect(find(view.tree, "root/u1/m1")).toBeUndefined();
            expect(outcome).toEqual({
                name: "name-m1",
                parentName: "name-u1",
                reloadRecommended: false,
            });
        });

        it("applies the removal before the request finishes", async () => {
            let finish!: () => void;
            setChildren.mockReturnValueOnce(
                new Promise<void>((resolve) => (finish = resolve)),
            );
            service.remove("root/u1/m1").subscribe();

            expect(find(view.tree, "root/u1/m1")).toBeUndefined();
            expect(service.saving).toBe(true);
            finish();
            await settle();
            expect(service.saving).toBe(false);
        });

        it("restores the exact previous tree and fails when the request fails", async () => {
            const before = view.tree;
            setChildren.mockRejectedValue(new Error("403"));

            const { outcome, error } = await run(service.remove("root/u1/m1"));

            expect(outcome).toBeUndefined();
            expect(error).toBeInstanceOf(HierarchyEditError);
            expect(error).toMatchObject({
                reason: "failed",
                reloadRequired: false,
            });
            expect(view.tree).toBe(before);
            expect(service.saving).toBe(false);
        });

        it("removes a linked root as a whole, with its subtree", async () => {
            const { error } = await run(service.remove("root/linked"));

            expect(error).toBeUndefined();
            expect(setChildren).toHaveBeenCalledWith("root", ["linked"], true);
            expect(find(view.tree, "root/linked")).toBeUndefined();
            expect(find(view.tree, "root/linked/lm")).toBeUndefined();
        });

        it.each([
            ["the root", "root"],
            ["a node inside a linked subtree", "root/linked/lm"],
            ["an unknown node", "nope"],
        ])("refuses to remove %s without sending anything", async (_, id) => {
            const before = view.tree;

            const { error } = await run(service.remove(id));

            expect(error).toMatchObject({ reason: "invalid" });
            expect(setChildren).not.toHaveBeenCalled();
            expect(view.tree).toBe(before);
        });

        it("removes only the named occurrence of a shared child and names its own parent", async () => {
            // m1 is also under u2 (a shared child).
            view.setTree([
                node("root", COURSE, {
                    children: [
                        node("u1", UNIT, {
                            id: "root/u1",
                            children: [
                                node("m1", MODULE, { id: "root/u1/m1" }),
                            ],
                        }),
                        node("u2", UNIT, {
                            id: "root/u2",
                            children: [
                                node("m1", MODULE, { id: "root/u2/m1" }),
                            ],
                        }),
                    ],
                }),
            ]);

            await run(service.remove("root/u2/m1"));

            expect(setChildren).toHaveBeenCalledWith("u2", ["m1"], true);
            expect(idsUnder("root/u1")).toEqual(["root/u1/m1"]);
            expect(idsUnder("root/u2")).toEqual([]);
        });

        it("recommends a reload when the parent appears more than once in the tree", async () => {
            // u1 is shared by two courses, so the server removes m1 from both.
            view.setTree([
                node("root", COURSE, {
                    children: [
                        node("u1", UNIT, {
                            id: "root/u1",
                            children: [
                                node("m1", MODULE, { id: "root/u1/m1" }),
                            ],
                        }),
                        node("c2", COURSE, {
                            id: "root/c2",
                            children: [
                                node("u1", UNIT, {
                                    id: "root/c2/u1",
                                    children: [
                                        node("m1", MODULE, {
                                            id: "root/c2/u1/m1",
                                        }),
                                    ],
                                }),
                            ],
                        }),
                    ],
                }),
            ]);

            const { outcome } = await run(service.remove("root/u1/m1"));

            expect(outcome?.reloadRecommended).toBe(true);
        });
    });

    describe("move", () => {
        it("adds to the new parent first, then removes from the old one", async () => {
            const { outcome, error } = await run(
                service.move("root/u1/m1", "root/u2"),
            );

            expect(error).toBeUndefined();
            expect(setChildren.mock.calls).toEqual([
                ["u2", ["m1"], false],
                ["u1", ["m1"], true],
            ]);
            expect(idsUnder("root/u2")).toEqual(["root/u1/m1"]);
            expect(idsUnder("root/u1")).toEqual([]);
            expect(outcome).toEqual({
                name: "name-m1",
                parentName: "name-u2",
                reloadRecommended: false,
            });
        });

        it("does not remove from the old parent until the add has succeeded", async () => {
            let finishAdd!: () => void;
            setChildren.mockReturnValueOnce(
                new Promise<void>((resolve) => (finishAdd = resolve)),
            );
            service.move("root/u1/m1", "root/u2").subscribe();

            expect(setChildren).toHaveBeenCalledTimes(1);
            finishAdd();
            await settle();
            expect(setChildren).toHaveBeenCalledTimes(2);
        });

        it("moves a linked root with its subtree", async () => {
            view.setTree([
                node("root", COURSE, {
                    children: [
                        node("c2", COURSE, { id: "root/c2" }),
                        node("linked", UNIT, {
                            id: "root/linked",
                            editable: false,
                            linkedRoot: true,
                            children: [
                                node("lm", MODULE, {
                                    id: "root/linked/lm",
                                    editable: false,
                                }),
                            ],
                        }),
                    ],
                }),
            ]);

            const { error } = await run(service.move("root/linked", "root/c2"));

            expect(error).toBeUndefined();
            expect(setChildren.mock.calls).toEqual([
                ["c2", ["linked"], false],
                ["root", ["linked"], true],
            ]);
            expect(idsUnder("root/c2")).toEqual(["root/linked"]);
            expect(find(view.tree, "root/linked/lm")).toBeDefined();
        });

        it("restores the tree and sends no removal when the add fails", async () => {
            const before = view.tree;
            setChildren.mockRejectedValueOnce(new Error("403"));

            const { outcome, error } = await run(
                service.move("root/u1/m1", "root/u2"),
            );

            expect(outcome).toBeUndefined();
            expect(error).toMatchObject({
                reason: "failed",
                reloadRequired: false,
            });
            expect(setChildren).toHaveBeenCalledTimes(1);
            expect(view.tree).toBe(before);
            expect(service.saving).toBe(false);
        });

        it("takes the child back out of the new parent when the removal fails", async () => {
            const before = view.tree;
            setChildren
                .mockResolvedValueOnce(undefined) // add to u2
                .mockRejectedValueOnce(new Error("500")) // remove from u1
                .mockResolvedValueOnce(undefined); // compensate: remove from u2

            const { error } = await run(service.move("root/u1/m1", "root/u2"));

            expect(setChildren.mock.calls).toEqual([
                ["u2", ["m1"], false],
                ["u1", ["m1"], true],
                ["u2", ["m1"], true],
            ]);
            expect(error).toMatchObject({
                reason: "failed",
                reloadRequired: false,
            });
            expect(view.tree).toBe(before);
        });

        it("asks for a reload when the compensating removal fails too", async () => {
            const before = view.tree;
            setChildren
                .mockResolvedValueOnce(undefined)
                .mockRejectedValue(new Error("500"));

            const { error } = await run(service.move("root/u1/m1", "root/u2"));

            expect(error).toMatchObject({
                reason: "failed",
                reloadRequired: true,
            });
            expect(view.tree).toBe(before);
            expect(service.saving).toBe(false);
        });

        it.each([
            ["into a linked/read-only subtree", "root/u1/m1", "root/linked/lm"],
            ["into a linked (read-only) root", "root/u2", "root/linked"],
            ["onto a parent that is not longer", "root/u1", "root/u2"],
            ["into its own descendant", "root/u1", "root/u1/m1"],
            ["onto itself", "root/u1", "root/u1"],
            ["within the same parent (a reorder)", "root/u1/m1", "root/u1"],
            ["the root", "root", "root/u1"],
            ["from inside a linked subtree", "root/linked/lm", "root/u1"],
            ["to an unknown parent", "root/u1/m1", "nope"],
        ])("refuses to move %s without sending anything", async (_, id, to) => {
            const before = view.tree;

            const { error } = await run(service.move(id, to));

            expect(error).toMatchObject({ reason: "invalid" });
            expect(setChildren).not.toHaveBeenCalled();
            expect(view.tree).toBe(before);
        });

        it("refuses a move into another occurrence of the learning object it already sits in", async () => {
            // Both units are the same learning object "u": moving m1 from one
            // occurrence to the other would add and then remove the same link.
            view.setTree([
                node("root", COURSE, {
                    children: [
                        node("u", UNIT, {
                            id: "root/a/u",
                            children: [
                                node("m1", MODULE, { id: "root/a/u/m1" }),
                            ],
                        }),
                        node("u", UNIT, { id: "root/b/u" }),
                    ],
                }),
            ]);

            const { error } = await run(
                service.move("root/a/u/m1", "root/b/u"),
            );

            expect(error).toMatchObject({ reason: "invalid" });
            expect(setChildren).not.toHaveBeenCalled();
        });

        it("refuses to move a unit under another occurrence of itself", async () => {
            // "u1" also appears under u9, so moving u1 into that occurrence
            // would make u1 its own descendant. The child-shorter-than-parent
            // rule rules this out, with no extra cycle check.
            view.setTree([
                node("root", COURSE, {
                    children: [
                        node("u1", UNIT, {
                            id: "root/u1",
                            children: [
                                node("m1", MODULE, { id: "root/u1/m1" }),
                            ],
                        }),
                        node("u9", UNIT, {
                            id: "root/u9",
                            children: [node("u1", UNIT, { id: "root/u9/u1" })],
                        }),
                    ],
                }),
            ]);

            const { error } = await run(service.move("root/u1", "root/u9/u1"));

            expect(error).toMatchObject({ reason: "invalid" });
            expect(setChildren).not.toHaveBeenCalled();
        });

        it("moves one occurrence of a shared child and leaves the other where it is", async () => {
            view.setTree([
                node("root", COURSE, {
                    children: [
                        node("u1", UNIT, {
                            id: "root/u1",
                            children: [
                                node("m1", MODULE, { id: "root/u1/m1" }),
                            ],
                        }),
                        node("u2", UNIT, {
                            id: "root/u2",
                            children: [
                                node("m1", MODULE, { id: "root/u2/m1" }),
                            ],
                        }),
                        node("u3", UNIT, { id: "root/u3" }),
                    ],
                }),
            ]);

            await run(service.move("root/u1/m1", "root/u3"));

            expect(setChildren.mock.calls).toEqual([
                ["u3", ["m1"], false],
                ["u1", ["m1"], true],
            ]);
            expect(idsUnder("root/u3")).toEqual(["root/u1/m1"]);
            expect(idsUnder("root/u2")).toEqual(["root/u2/m1"]);
        });

        it("recommends a reload when the old parent appears more than once", async () => {
            view.setTree([
                node("root", COURSE, {
                    children: [
                        node("u1", UNIT, {
                            id: "root/u1",
                            children: [
                                node("m1", MODULE, { id: "root/u1/m1" }),
                            ],
                        }),
                        node("c2", COURSE, {
                            id: "root/c2",
                            children: [node("u1", UNIT, { id: "root/c2/u1" })],
                        }),
                        node("u3", UNIT, { id: "root/u3" }),
                    ],
                }),
            ]);

            const { outcome } = await run(
                service.move("root/u1/m1", "root/u3"),
            );

            expect(outcome?.reloadRecommended).toBe(true);
        });
    });

    describe("one edit at a time", () => {
        it("refuses a second edit while one is saving and sends nothing for it", async () => {
            let finish!: () => void;
            setChildren.mockReturnValueOnce(
                new Promise<void>((resolve) => (finish = resolve)),
            );
            service.remove("root/u1/m1").subscribe();
            const treeWhileSaving = view.tree;

            const { error } = await run(service.remove("root/u2"));

            expect(error).toMatchObject({ reason: "busy" });
            expect(setChildren).toHaveBeenCalledTimes(1);
            expect(view.tree).toBe(treeWhileSaving);

            finish();
            await settle();
            expect(service.saving).toBe(false);
        });

        it("publishes saving$ true during the request and false after", async () => {
            const seen: boolean[] = [];
            service.saving$.subscribe((saving) => seen.push(saving));

            await run(service.remove("root/u1/m1"));

            expect(seen).toEqual([false, true, false]);
        });

        it("accepts a new edit after a failed one", async () => {
            setChildren.mockRejectedValueOnce(new Error("500"));
            await run(service.remove("root/u1/m1"));

            const { error } = await run(service.remove("root/u1/m1"));

            expect(error).toBeUndefined();
            expect(find(view.tree, "root/u1/m1")).toBeUndefined();
        });

        it("releases the lock when the subscriber leaves before the save ends", async () => {
            let finish!: () => void;
            setChildren.mockReturnValueOnce(
                new Promise<void>((resolve) => (finish = resolve)),
            );
            const subscription = service.remove("root/u1/m1").subscribe();
            expect(service.saving).toBe(true);

            subscription.unsubscribe();

            expect(service.saving).toBe(false);
            finish();
            await settle();
        });
    });
    describe("create", () => {
        let checkNameAvailability: jest.Mock;
        let create: jest.Mock;
        let save: jest.Mock;
        let deleteObject: jest.Mock;
        /** What the API returns for a created object. */
        const created = {
            id: "new-1",
            cuid: "cuid-new-1",
            version: 0,
            length: LearningObject.Length.NANOMODULE,
        };
        const request = { name: "  My Module  ", length: MODULE };

        async function runCreate(
            parentNodeId: string,
            req: { name: string; length: LearningObject.Length } = request,
        ): Promise<{
            outcome?: HierarchyCreateOutcome;
            error?: HierarchyEditError;
        }> {
            const result: {
                outcome?: HierarchyCreateOutcome;
                error?: HierarchyEditError;
            } = {};
            service.create(parentNodeId, req).subscribe({
                next: (outcome) => (result.outcome = outcome),
                error: (error) => (result.error = error),
            });
            await settle();

            return result;
        }

        beforeEach(() => {
            checkNameAvailability = jest.fn().mockResolvedValue(true);
            create = jest.fn().mockResolvedValue(created);
            save = jest.fn().mockResolvedValue({});
            deleteObject = jest.fn().mockResolvedValue({});
            service = new HierarchyEditService(
                {
                    setChildren,
                    checkNameAvailability,
                    create,
                    save,
                    delete: deleteObject,
                } as any,
                view,
            );
        });

        it("checks the name, creates, sets the length, then attaches, in that order", async () => {
            const calls: string[] = [];
            checkNameAvailability.mockImplementation(async () => {
                calls.push("check");
                return true;
            });
            create.mockImplementation(async () => {
                calls.push("create");
                return created;
            });
            save.mockImplementation(async () => {
                calls.push("save");
                return {};
            });
            setChildren.mockImplementation(async () => {
                calls.push("attach");
            });
            const { error } = await runCreate("root/u1");
            expect(error).toBeUndefined();
            expect(calls).toEqual(["check", "create", "save", "attach"]);
        });

        it("sends the trimmed name, the Dashboard's unreleased status, then the length and the attach", async () => {
            await runCreate("root/u1");
            expect(checkNameAvailability).toHaveBeenCalledWith("My Module");
            expect(create).toHaveBeenCalledWith({
                name: "My Module",
                length: MODULE,
                status: LearningObject.Status.UNRELEASED,
            });
            expect(save).toHaveBeenCalledWith("new-1", { length: MODULE });
            expect(setChildren).toHaveBeenCalledWith("u1", ["new-1"], false);
            expect(deleteObject).not.toHaveBeenCalled();
        });

        it("adds the new editable child as the parent's last child and reports it", async () => {
            const { outcome, error } = await runCreate("root/u1");
            expect(error).toBeUndefined();
            expect(idsUnder("root/u1")).toEqual([
                "root/u1/m1",
                "root/u1/new-1",
            ]);
            expect(outcome?.node).toMatchObject({
                id: "root/u1/new-1",
                learningObjectId: "new-1",
                cuid: "cuid-new-1",
                version: 0,
                name: "My Module",
                length: MODULE,
                editable: true,
            });
            expect(outcome).toMatchObject({
                name: "My Module",
                parentName: "name-u1",
                reloadRecommended: false,
            });
            expect(find(view.tree, "root/u1")!.expanded).toBe(true);
        });

        it("can add to the root", async () => {
            const { error } = await runCreate("root", {
                name: "A unit",
                length: UNIT,
            });
            expect(error).toBeUndefined();
            expect(setChildren).toHaveBeenCalledWith("root", ["new-1"], false);
            expect(find(view.tree, "root/new-1")).toBeDefined();
        });

        it("leaves the tree untouched until every call has succeeded", async () => {
            let finish!: () => void;
            setChildren.mockReturnValueOnce(
                new Promise<void>((resolve) => (finish = resolve)),
            );
            service.create("root/u1", request).subscribe();
            await settle();
            expect(service.saving).toBe(true);
            expect(find(view.tree, "root/u1/new-1")).toBeUndefined();
            finish();
            await settle();
            expect(service.saving).toBe(false);
            expect(find(view.tree, "root/u1/new-1")).toBeDefined();
        });

        it("reports a reload when the parent appears more than once in the tree", async () => {
            view.setTree([
                node("root", COURSE, {
                    children: [
                        node("u1", UNIT, {
                            id: "root/u1",
                            learningObjectId: "u1",
                        }),
                        node("u2", UNIT, {
                            id: "root/u2",
                            learningObjectId: "u2",
                            children: [
                                node("u1", UNIT, {
                                    id: "root/u2/u1",
                                    learningObjectId: "u1",
                                }),
                            ],
                        }),
                    ],
                }),
            ]);
            const { outcome } = await runCreate("root/u1");
            expect(outcome?.reloadRecommended).toBe(true);
        });

        describe("name problems (nothing is created)", () => {
            it("refuses a name that is already used, without creating", async () => {
                checkNameAvailability.mockResolvedValue(false);
                const { error } = await runCreate("root/u1");
                expect(error?.reason).toBe("name-taken");
                expect(create).not.toHaveBeenCalled();
                expect(idsUnder("root/u1")).toEqual(["root/u1/m1"]);
                expect(service.saving).toBe(false);
            });

            it("lets the create call decide when the availability check itself fails", async () => {
                checkNameAvailability.mockRejectedValue(new Error("500"));
                const { outcome, error } = await runCreate("root/u1");
                expect(error).toBeUndefined();
                expect(outcome).toBeDefined();
                expect(create).toHaveBeenCalledTimes(1);
            });

            it.each(["a/b", "a\\b", 'a"b', "a*b", "a|b"])(
                "refuses %s without any request",
                async (name) => {
                    const { error } = await runCreate("root/u1", {
                        name,
                        length: MODULE,
                    });
                    expect(error?.reason).toBe("name-invalid");
                    expect(checkNameAvailability).not.toHaveBeenCalled();
                    expect(create).not.toHaveBeenCalled();
                },
            );

            it("refuses a blank name without any request", async () => {
                const { error } = await runCreate("root/u1", {
                    name: "   ",
                    length: MODULE,
                });
                expect(error?.reason).toBe("name-invalid");
                expect(create).not.toHaveBeenCalled();
            });

            it("maps a 409 from create to name-taken", async () => {
                create.mockRejectedValue({ status: 409 });
                const { error } = await runCreate("root/u1");
                expect(error?.reason).toBe("name-taken");
                expect(deleteObject).not.toHaveBeenCalled();
            });

            it("maps a 400 from create to name-invalid", async () => {
                create.mockRejectedValue({ status: 400 });
                const { error } = await runCreate("root/u1");
                expect(error?.reason).toBe("name-invalid");
            });
        });

        describe("failures", () => {
            it("fails without cleanup when create fails, and leaves the tree as it was", async () => {
                const before = view.tree;
                create.mockRejectedValue({ status: 500 });
                const { outcome, error } = await runCreate("root/u1");
                expect(outcome).toBeUndefined();
                expect(error).toBeInstanceOf(HierarchyEditError);
                expect(error).toMatchObject({
                    reason: "failed",
                    reloadRequired: false,
                    leftInLibrary: false,
                });
                expect(save).not.toHaveBeenCalled();
                expect(setChildren).not.toHaveBeenCalled();
                expect(deleteObject).not.toHaveBeenCalled();
                expect(view.tree).toBe(before);
            });

            it("deletes the new object when setting its length fails", async () => {
                const before = view.tree;
                save.mockRejectedValue({ status: 500 });
                const { error } = await runCreate("root/u1");
                expect(error).toMatchObject({
                    reason: "failed",
                    reloadRequired: false,
                    leftInLibrary: false,
                });
                expect(setChildren).not.toHaveBeenCalled();
                expect(deleteObject).toHaveBeenCalledWith("new-1");
                expect(view.tree).toBe(before);
                expect(service.saving).toBe(false);
            });

            it("deletes the new object when attaching it fails", async () => {
                const before = view.tree;
                setChildren.mockRejectedValue({ status: 403 });
                const { error } = await runCreate("root/u1");
                expect(error).toMatchObject({
                    reason: "failed",
                    reloadRequired: false,
                    leftInLibrary: false,
                });
                expect(deleteObject).toHaveBeenCalledTimes(1);
                expect(deleteObject).toHaveBeenCalledWith("new-1");
                expect(view.tree).toBe(before);
            });

            it("says the object is left in the library when the cleanup also fails after the length step", async () => {
                save.mockRejectedValue({ status: 500 });
                deleteObject.mockRejectedValue({ status: 500 });
                const { error } = await runCreate("root/u1");
                expect(error).toMatchObject({
                    reason: "failed",
                    reloadRequired: false,
                    leftInLibrary: true,
                });
            });

            it("also asks for a reload when the attach failed and the cleanup failed", async () => {
                setChildren.mockRejectedValue({ status: 500 });
                deleteObject.mockRejectedValue({ status: 500 });
                const { error } = await runCreate("root/u1");
                expect(error).toMatchObject({
                    reason: "failed",
                    reloadRequired: true,
                    leftInLibrary: true,
                });
                expect(find(view.tree, "root/u1/new-1")).toBeUndefined();
            });

            it("accepts a new edit after a failed create", async () => {
                create.mockRejectedValueOnce({ status: 500 });
                await runCreate("root/u1");
                const { outcome, error } = await runCreate("root/u1");
                expect(error).toBeUndefined();
                expect(outcome).toBeDefined();
            });

            it("releases the lock when the subscriber leaves before the save ends", async () => {
                let finish!: () => void;
                create.mockReturnValueOnce(
                    new Promise((resolve) => (finish = () => resolve(created))),
                );
                const subscription = service
                    .create("root/u1", request)
                    .subscribe();
                await settle();
                expect(service.saving).toBe(true);
                subscription.unsubscribe();
                expect(service.saving).toBe(false);
                finish();
                await settle();
            });
        });

        describe("refused up front (nothing is sent)", () => {
            const expectNoRequests = () => {
                expect(checkNameAvailability).not.toHaveBeenCalled();
                expect(create).not.toHaveBeenCalled();
                expect(save).not.toHaveBeenCalled();
                expect(setChildren).not.toHaveBeenCalled();
            };

            it("refuses an unknown parent", async () => {
                const { error } = await runCreate("nope");
                expect(error?.reason).toBe("invalid");
                expectNoRequests();
            });

            it("refuses a read-only (linked) parent", async () => {
                const { error } = await runCreate("root/linked", {
                    name: "x",
                    length: MODULE,
                });
                expect(error?.reason).toBe("invalid");
                expectNoRequests();
            });

            it("refuses a parent inside a linked subtree", async () => {
                const { error } = await runCreate("root/linked/lm", {
                    name: "x",
                    length: MICROMODULE,
                });
                expect(error?.reason).toBe("invalid");
                expectNoRequests();
            });

            it("refuses a Nanomodule parent", async () => {
                view.setTree([
                    node("root", COURSE, {
                        children: [
                            node("n1", LearningObject.Length.NANOMODULE, {
                                id: "root/n1",
                                learningObjectId: "n1",
                            }),
                        ],
                    }),
                ]);
                const { error } = await runCreate("root/n1", {
                    name: "x",
                    length: LearningObject.Length.NANOMODULE,
                });
                expect(error?.reason).toBe("invalid");
                expectNoRequests();
            });

            it("refuses a length that is not shorter than the parent", async () => {
                const same = await runCreate("root/u1", {
                    name: "x",
                    length: UNIT,
                });
                const longer = await runCreate("root/u1", {
                    name: "x",
                    length: COURSE,
                });
                expect(same.error?.reason).toBe("invalid");
                expect(longer.error?.reason).toBe("invalid");
                expectNoRequests();
            });

            it("refuses while another edit is saving", async () => {
                let finish!: () => void;
                setChildren.mockReturnValueOnce(
                    new Promise<void>((resolve) => (finish = resolve)),
                );
                service.remove("root/u1/m1").subscribe();
                const { error } = await runCreate("root/u2", {
                    name: "x",
                    length: MODULE,
                });
                expect(error?.reason).toBe("busy");
                expect(create).not.toHaveBeenCalled();
                finish();
                await settle();
            });

            it("blocks other edits while a create is saving", async () => {
                let finish!: () => void;
                create.mockReturnValueOnce(
                    new Promise((resolve) => (finish = () => resolve(created))),
                );
                service.create("root/u1", request).subscribe();
                await settle();
                const { error } = await run(service.remove("root/u2"));
                expect(error?.reason).toBe("busy");
                finish();
                await settle();
            });
        });
    });
});

function find(nodes: HierarchyNode[], id: string): HierarchyNode | undefined {
    for (const n of nodes) {
        if (n.id === id) {
            return n;
        }
        const found = find(n.children, id);
        if (found) {
            return found;
        }
    }

    return undefined;
}
