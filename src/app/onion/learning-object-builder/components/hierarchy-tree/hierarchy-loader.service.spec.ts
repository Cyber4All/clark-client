import { LearningObject } from "@entity";
import { HierarchyLoaderService } from "./hierarchy-loader.service";
import { HierarchyViewService } from "./hierarchy-view.service";

// The real service imports via the bare "app/..." path, which this repo's Jest
// config cannot resolve. Only the DI token is needed here.
jest.mock(
    "../../../../core/learning-object-module/learning-object/learning-object.service",
    () => ({ LearningObjectService: class LearningObjectService {} }),
);

const { COURSE, UNIT, MODULE, NANOMODULE } = LearningObject.Length;

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
        expect(rootNode.children.map((c) => c.id)).toEqual(["u1", "n1"]);
        expect(rootNode.children[0].children.map((c) => c.id)).toEqual(["m1"]);
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

    it("skips ids that already appear in the tree (cycle guard)", async () => {
        children["root"] = async () => [child("u1", UNIT)];
        children["u1"] = async () => [
            child("root", COURSE),
            child("m1", MODULE),
        ];

        loader.load(root());
        await settle();

        expect(view.tree[0].children[0].children.map((c) => c.id)).toEqual([
            "m1",
        ]);
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
        expect(view.tree[0].children.map((c) => c.id)).toEqual(["u1"]);
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

        expect(view.tree[0].children.map((c) => c.id)).toEqual(["u1"]);
    });

    it("retry does nothing before any load", () => {
        loader.retry();
        expect(getLearningObjectChildren).not.toHaveBeenCalled();
    });
});
