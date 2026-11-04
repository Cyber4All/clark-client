import { Observable, of, Subject, throwError } from "rxjs";
import { LearningObject } from "@entity";
import { HierarchyChildPayload } from "../../../../core/learning-object-module/hierarchy/hierarchy.types";
import { HierarchyLoaderService } from "./hierarchy-loader.service";
import { HierarchyViewService } from "./hierarchy-view.service";

const { COURSE, UNIT, MODULE, NANOMODULE } = LearningObject.Length;

const child = (
    id: string,
    length: LearningObject.Length,
    author = "alice",
): HierarchyChildPayload => ({
    id,
    name: `name-${id}`,
    length,
    status: LearningObject.Status.UNRELEASED,
    author: { username: author },
    contributors: [],
});

const root = (): LearningObject =>
    ({ id: "root", name: "Root", length: COURSE }) as LearningObject;

describe("HierarchyLoaderService", () => {
    let children: Record<string, Observable<HierarchyChildPayload[]>>;
    let getChildren: jest.Mock;
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
        getChildren = jest.fn((id: string) => children[id] ?? of([]));
        username = "alice";
        view = new HierarchyViewService();
        loader = new HierarchyLoaderService({ getChildren } as any, view, {
            get username() {
                return username;
            },
            isAdminOrEditor: () => false,
        } as any);
    });

    it("builds a nested tree from per-level children requests", () => {
        children["root"] = of([child("u1", UNIT), child("n1", NANOMODULE)]);
        children["u1"] = of([child("m1", MODULE)]);

        loader.load(root());

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

    it("never requests children of a nanomodule", () => {
        children["root"] = of([child("n1", NANOMODULE)]);

        loader.load(root());

        expect(getChildren).toHaveBeenCalledTimes(1);
        expect(getChildren).toHaveBeenCalledWith("root");
    });

    it("reports empty when the root has no children", () => {
        loader.load(root());

        expect(status()).toBe("empty");
        expect(view.tree[0].children).toEqual([]);
    });

    it("marks children the viewer cannot edit as linked and freezes their subtree", () => {
        children["root"] = of([child("u1", UNIT, "someone-else")]);
        children["u1"] = of([child("m1", MODULE, "alice")]);

        loader.load(root());

        const [unit] = view.tree[0].children;
        expect(unit).toMatchObject({ editable: false, linkedRoot: true });
        expect(unit.children[0]).toMatchObject({ editable: false });
        expect(unit.children[0].linkedRoot).toBeUndefined();
    });

    it("skips ids that already appear in the tree (cycle guard)", () => {
        children["root"] = of([child("u1", UNIT)]);
        children["u1"] = of([child("root", COURSE), child("m1", MODULE)]);

        loader.load(root());

        expect(view.tree[0].children[0].children.map((c) => c.id)).toEqual([
            "m1",
        ]);
    });

    it("sets error and an empty tree when a request fails, and retry recovers", () => {
        children["root"] = throwError(() => new Error("boom"));
        loader.load(root());

        expect(status()).toBe("error");
        expect(view.tree).toEqual([]);

        children["root"] = of([child("u1", UNIT)]);
        loader.retry();

        expect(status()).toBe("ready");
        expect(view.tree[0].children.map((c) => c.id)).toEqual(["u1"]);
    });

    it("is loading while the request is in flight", () => {
        const pending = new Subject<HierarchyChildPayload[]>();
        children["root"] = pending;

        loader.load(root());
        expect(status()).toBe("loading");

        pending.next([]);
        pending.complete();
        expect(status()).toBe("empty");
    });

    it("cancels a load in flight when load is called again", () => {
        const stale = new Subject<HierarchyChildPayload[]>();
        children["root"] = stale;
        loader.load(root());

        children["root"] = of([child("u1", UNIT)]);
        loader.load(root());
        stale.next([child("old", UNIT)]);

        expect(view.tree[0].children.map((c) => c.id)).toEqual(["u1"]);
    });

    it("retry does nothing before any load", () => {
        loader.retry();
        expect(getChildren).not.toHaveBeenCalled();
    });
});
