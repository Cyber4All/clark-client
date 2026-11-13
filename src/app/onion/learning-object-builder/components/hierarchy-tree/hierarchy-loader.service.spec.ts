import { LearningObject } from "@entity";
import { HierarchyLoaderService } from "./hierarchy-loader.service";
import { HierarchyViewService } from "./hierarchy-view.service";

// The real service imports via the bare "app/..." path, which this repo's Jest
// config cannot resolve. Only the DI token is needed here.
jest.mock(
    "../../../../core/learning-object-module/learning-object/learning-object.service",
    () => ({ LearningObjectService: class LearningObjectService {} }),
);

const { COURSE, UNIT, MODULE, MICROMODULE, NANOMODULE } = LearningObject.Length;

const child = (
    id: string,
    length: LearningObject.Length,
    author = "alice",
): LearningObject =>
    ({
        id,
        name: `name-${id}`,
        length,
        status: LearningObject.Status.UNRELEASED,
        author: { username: author },
        contributors: [],
    }) as unknown as LearningObject;

const root = (): LearningObject =>
    ({ id: "root", name: "Root", length: COURSE }) as LearningObject;

/** Let pending promise callbacks (and the rxjs they feed) run. */
const settle = (): Promise<void> => new Promise((r) => setTimeout(r, 0));

describe("HierarchyLoaderService", () => {
    let children: Record<string, () => Promise<LearningObject[]>>;
    let getLearningObjectChildren: jest.Mock;
    let view: HierarchyViewService;
    let loader: HierarchyLoaderService;
    let username: string;

    /** Current status (status$ is a BehaviorSubject, so it emits synchronously). */
    const status = (): string => {
        let current = "";
        loader.status$.subscribe((s) => (current = s)).unsubscribe();

        return current;
    };

    beforeEach(() => {
        children = {};
        getLearningObjectChildren = jest.fn((id: string) =>
            children[id] ? children[id]() : Promise.resolve([]),
        );
        username = "alice";
        view = new HierarchyViewService();
        loader = new HierarchyLoaderService(
            { getLearningObjectChildren } as any,
            view,
            {
                get username() {
                    return username;
                },
                isAdminOrEditor: () => false,
            } as any,
        );
    });

    it("builds a nested tree from per-level children requests", async () => {
        children["root"] = async () => [
            child("u1", UNIT),
            child("n1", NANOMODULE),
        ];
        children["u1"] = async () => [child("m1", MODULE)];

        loader.load(root());
        await settle();

        expect(status()).toBe("ready");
        const [rootNode] = view.tree;
        expect(rootNode).toMatchObject({
            id: "root",
            editable: true,
            expanded: true,
        });
        expect(rootNode.children.map((c) => c.learningObjectId)).toEqual([
            "u1",
            "n1",
        ]);
        expect(
            rootNode.children[0].children.map((c) => c.learningObjectId),
        ).toEqual(["m1"]);
    });

    it("gives the root and its children their Builder address", async () => {
        children["root"] = async () => [
            Object.assign(child("u1", UNIT), { cuid: "cu-u1", version: 1 }),
        ];
        loader.load(Object.assign(root(), { cuid: "cu-root", version: 0 }));
        await settle();
        const [rootNode] = view.tree;
        expect(rootNode).toMatchObject({ cuid: "cu-root", version: 0 });
        expect(rootNode.children[0]).toMatchObject({
            cuid: "cu-u1",
            version: 1,
        });
    });
    it("never requests children of a nanomodule", async () => {
        children["root"] = async () => [child("n1", NANOMODULE)];

        loader.load(root());
        await settle();

        expect(getLearningObjectChildren).toHaveBeenCalledTimes(1);
        expect(getLearningObjectChildren).toHaveBeenCalledWith("root");
    });

    it("reports empty when the root has no children", async () => {
        loader.load(root());
        await settle();

        expect(status()).toBe("empty");
        expect(view.tree[0].children).toEqual([]);
    });

    it("marks children the viewer cannot edit as linked and freezes their subtree", async () => {
        children["root"] = async () => [child("u1", UNIT, "someone-else")];
        children["u1"] = async () => [child("m1", MODULE, "alice")];

        loader.load(root());
        await settle();

        const [unit] = view.tree[0].children;
        expect(unit).toMatchObject({ editable: false, linkedRoot: true });
        expect(unit.children[0]).toMatchObject({ editable: false });
        expect(unit.children[0].linkedRoot).toBeUndefined();
    });

    it("cuts a child that is one of its own ancestors (cycle guard)", async () => {
        children["root"] = async () => [child("u1", UNIT)];
        children["u1"] = async () => [
            child("root", COURSE),
            child("m1", MODULE),
        ];

        loader.load(root());
        await settle();

        expect(
            view.tree[0].children[0].children.map((c) => c.learningObjectId),
        ).toEqual(["m1"]);
    });

    it("cuts a cycle back to a non-root ancestor but keeps the rest of the tree", async () => {
        children["root"] = async () => [child("u1", UNIT), child("u2", UNIT)];
        children["u1"] = async () => [child("m1", MODULE)];
        // m1 lists its own ancestor u1, which must be cut; micro1 stays.
        children["m1"] = async () => [
            child("u1", UNIT),
            child("micro1", MICROMODULE),
        ];

        loader.load(root());
        await settle();

        const [u1, u2] = view.tree[0].children;
        expect(u1.children[0].children.map((c) => c.learningObjectId)).toEqual([
            "micro1",
        ]);
        expect(u2.learningObjectId).toBe("u2");
        expect(status()).toBe("ready");
    });

    it("keeps a child repeated inside one parent's response only once", async () => {
        children["root"] = async () => [
            child("u1", UNIT),
            child("u1", UNIT),
            child("n1", NANOMODULE),
        ];

        loader.load(root());
        await settle();

        expect(view.tree[0].children.map((c) => c.learningObjectId)).toEqual([
            "u1",
            "n1",
        ]);
    });

    describe("a child shared by two parents", () => {
        /** root -> [u1, u2]; both units contain module m1; m1 contains micro1. */
        function shareModule(
            order: "u1-first" | "u2-first",
        ): () => Promise<void> {
            const gates: Record<string, () => void> = {};
            const gated = (id: string, kids: LearningObject[]) => () =>
                new Promise<LearningObject[]>((resolve) => {
                    gates[id] = () => resolve(kids);
                });
            children["root"] = async () => [
                child("u1", UNIT),
                child("u2", UNIT),
            ];
            children["u1"] = gated("u1", [child("m1", MODULE)]);
            children["u2"] = gated("u2", [child("m1", MODULE)]);
            children["m1"] = async () => [child("micro1", MICROMODULE)];

            return async () => {
                await settle();
                const [first, second] =
                    order === "u1-first" ? ["u1", "u2"] : ["u2", "u1"];
                gates[first]();
                await settle();
                gates[second]();
                await settle();
            };
        }

        it.each(["u1-first", "u2-first"] as const)(
            "shows it under BOTH parents when %s resolves first",
            async (order) => {
                const resolve = shareModule(order);

                loader.load(root());
                await resolve();

                expect(status()).toBe("ready");
                const [u1, u2] = view.tree[0].children;
                expect(u1.learningObjectId).toBe("u1");
                expect(u2.learningObjectId).toBe("u2");
                for (const unit of [u1, u2]) {
                    expect(unit.children).toHaveLength(1);
                    expect(unit.children[0].learningObjectId).toBe("m1");
                    expect(
                        unit.children[0].children.map(
                            (c) => c.learningObjectId,
                        ),
                    ).toEqual(["micro1"]);
                }
            },
        );

        it("gives each occurrence a distinct id and the same learningObjectId", async () => {
            const resolve = shareModule("u1-first");

            loader.load(root());
            await resolve();

            const [u1, u2] = view.tree[0].children;
            expect(u1.children[0].id).toBe("root/u1/m1");
            expect(u2.children[0].id).toBe("root/u2/m1");
            expect(u1.children[0].children[0].id).toBe("root/u1/m1/micro1");
            expect(u2.children[0].children[0].id).toBe("root/u2/m1/micro1");

            const ids: string[] = [];
            const walkIds = (nodes: typeof view.tree) =>
                nodes.forEach((n) => {
                    ids.push(n.id);
                    walkIds(n.children);
                });
            walkIds(view.tree);
            expect(new Set(ids).size).toBe(ids.length);
        });

        it("produces the same tree whichever request resolves first", async () => {
            const resolveA = shareModule("u1-first");
            loader.load(root());
            await resolveA();
            const treeA = JSON.stringify(view.tree);

            const resolveB = shareModule("u2-first");
            loader.load(root());
            await resolveB();

            expect(JSON.stringify(view.tree)).toBe(treeA);
        });

        it("requests the shared child's children only once", async () => {
            const resolve = shareModule("u1-first");

            loader.load(root());
            await resolve();

            const calls = getLearningObjectChildren.mock.calls.filter(
                ([id]) => id === "m1",
            );
            expect(calls).toHaveLength(1);
        });

        it("refetches on retry (the request cache is per load)", async () => {
            children["root"] = async () => [child("u1", UNIT)];
            loader.load(root());
            await settle();
            loader.retry();
            await settle();

            const calls = getLearningObjectChildren.mock.calls.filter(
                ([id]) => id === "root",
            );
            expect(calls).toHaveLength(2);
        });
    });

    it("sets error and an empty tree when a request fails, and retry recovers", async () => {
        children["root"] = () => Promise.reject(new Error("boom"));
        loader.load(root());
        await settle();

        expect(status()).toBe("error");
        expect(view.tree).toEqual([]);

        children["root"] = async () => [child("u1", UNIT)];
        loader.retry();
        await settle();

        expect(status()).toBe("ready");
        expect(view.tree[0].children.map((c) => c.learningObjectId)).toEqual([
            "u1",
        ]);
    });

    it("is loading while the request is in flight", async () => {
        let resolve!: (value: LearningObject[]) => void;
        children["root"] = () =>
            new Promise<LearningObject[]>((r) => (resolve = r));

        loader.load(root());
        expect(status()).toBe("loading");

        resolve([]);
        await settle();
        expect(status()).toBe("empty");
    });

    it("ignores a stale response when load is called again", async () => {
        let resolveStale!: (value: LearningObject[]) => void;
        children["root"] = () =>
            new Promise<LearningObject[]>((r) => (resolveStale = r));
        loader.load(root());

        children["root"] = async () => [child("u1", UNIT)];
        loader.load(root());
        resolveStale([child("old", UNIT)]);
        await settle();

        expect(view.tree[0].children.map((c) => c.learningObjectId)).toEqual([
            "u1",
        ]);
    });

    it("retry does nothing before any load", () => {
        loader.retry();
        expect(getLearningObjectChildren).not.toHaveBeenCalled();
    });
});
