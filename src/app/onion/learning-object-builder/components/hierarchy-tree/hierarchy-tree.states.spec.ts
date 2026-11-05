import { ComponentFixture, TestBed } from "@angular/core/testing";
import { LiveAnnouncer } from "@angular/cdk/a11y";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { BehaviorSubject } from "rxjs";
import { LearningObject } from "@entity";
import { ToastrOvenService } from "../../../../shared/modules/toaster/notification.service";
import { HierarchyLoaderService } from "./hierarchy-loader.service";
import { HierarchyLoadStatus } from "./hierarchy-tree.types";
import { HierarchyTreeComponent } from "./hierarchy-tree.component";
import { HierarchyViewService } from "./hierarchy-view.service";

// The real service imports via the bare "app/..." path, which this repo's Jest
// config cannot resolve. Only the DI token is needed here.
jest.mock(
    "../../../../core/learning-object-module/learning-object/learning-object.service",
    () => ({ LearningObjectService: class LearningObjectService {} }),
);

describe("HierarchyTreeComponent load states", () => {
    let fixture: ComponentFixture<HierarchyTreeComponent>;
    let status$: BehaviorSubject<HierarchyLoadStatus>;
    let loader: {
        status$: BehaviorSubject<HierarchyLoadStatus>;
        load: jest.Mock;
        retry: jest.Mock;
    };
    let view: HierarchyViewService;

    const el = (): HTMLElement => fixture.nativeElement;

    beforeEach(() => {
        status$ = new BehaviorSubject<HierarchyLoadStatus>("loading");
        loader = { status$, load: jest.fn(), retry: jest.fn() };
        TestBed.configureTestingModule({
            imports: [HierarchyTreeComponent, NoopAnimationsModule],
            providers: [
                HierarchyViewService,
                { provide: HierarchyLoaderService, useValue: loader },
                {
                    provide: ToastrOvenService,
                    useValue: { success: jest.fn() },
                },
                { provide: LiveAnnouncer, useValue: { announce: jest.fn() } },
            ],
        });
        view = TestBed.inject(HierarchyViewService);
        fixture = TestBed.createComponent(HierarchyTreeComponent);
        fixture.componentInstance.learningObject = {
            id: "root",
            name: "Root",
            length: LearningObject.Length.COURSE,
        } as LearningObject;
        fixture.detectChanges();
    });

    it("requests the load for the learning object on init", () => {
        expect(loader.load).toHaveBeenCalledWith(
            fixture.componentInstance.learningObject,
        );
    });

    it("shows a busy indicator and no tree while loading", () => {
        expect(el().querySelector('[aria-busy="true"]')).toBeTruthy();
        expect(el().querySelector(".hierarchy-tree")).toBeNull();
    });

    it("shows an alert with a working Retry button on error", () => {
        status$.next("error");
        fixture.detectChanges();

        expect(el().querySelector('[role="alert"]')).toBeTruthy();
        expect(el().querySelector(".hierarchy-tree")).toBeNull();
        el()
            .querySelector<HTMLButtonElement>(".hierarchy-state__retry")!
            .click();
        expect(loader.retry).toHaveBeenCalledTimes(1);
    });

    it("shows the root and an empty message when there are no children", () => {
        view.setTree([
            {
                id: "root",
                name: "Root",
                length: LearningObject.Length.COURSE,
                editable: true,
                expanded: true,
                children: [],
            },
        ]);
        status$.next("empty");
        fixture.detectChanges();

        expect(
            el().querySelector('.node-row[data-node-id="root"]'),
        ).toBeTruthy();
        expect(
            el().querySelector(".hierarchy-state__empty")?.textContent,
        ).toContain("no children");
    });

    it("hides the empty message when the hierarchy is ready", () => {
        status$.next("ready");
        fixture.detectChanges();

        expect(el().querySelector(".hierarchy-state__empty")).toBeNull();
    });

    describe("a learning object shown under two parents", () => {
        const shared = (parentKey: string) => ({
            id: `${parentKey}/m1`,
            learningObjectId: "m1",
            name: "Shared Module",
            length: LearningObject.Length.MODULE,
            editable: true,
            children: [
                {
                    id: `${parentKey}/m1/micro1`,
                    learningObjectId: "micro1",
                    name: "Micro",
                    length: LearningObject.Length.MICROMODULE,
                    editable: true,
                    children: [],
                },
            ],
        });
        const unit = (id: string) => ({
            id: `root/${id}`,
            learningObjectId: id,
            name: id,
            length: LearningObject.Length.UNIT,
            editable: true,
            expanded: true,
            children: [shared(`root/${id}`)],
        });

        beforeEach(() => {
            view.setTree([
                {
                    id: "root",
                    learningObjectId: "root",
                    name: "Root",
                    length: LearningObject.Length.COURSE,
                    editable: true,
                    expanded: true,
                    children: [unit("u1"), unit("u2")],
                },
            ]);
            status$.next("ready");
            fixture.detectChanges();
        });

        const rowIds = (): string[] =>
            Array.from(el().querySelectorAll(".node-row[data-node-id]")).map(
                (row) => row.getAttribute("data-node-id")!,
            );

        it("renders one row per occurrence with a unique data-node-id", () => {
            const ids = rowIds();

            expect(ids).toEqual(
                expect.arrayContaining(["root/u1/m1", "root/u2/m1"]),
            );
            expect(new Set(ids).size).toBe(ids.length);
        });

        it("expands and collapses only the occurrence whose toggle was used", () => {
            const toggleFor = (id: string) =>
                el().querySelector<HTMLButtonElement>(
                    `.node-row[data-node-id="${id}"] .toggle`,
                )!;
            const microRows = () =>
                rowIds().filter((id) => id.endsWith("/micro1"));

            // Each shared module is collapsed; its child is not rendered.
            expect(microRows()).toEqual([]);

            toggleFor("root/u1/m1").click();
            fixture.detectChanges();
            expect(microRows()).toEqual(["root/u1/m1/micro1"]);
            expect(toggleFor("root/u2/m1").getAttribute("aria-expanded")).toBe(
                "false",
            );

            // Collapsing is asserted on state, not row absence: collapsed rows
            // can linger in the DOM for a leave animation.
            toggleFor("root/u1/m1").click();
            fixture.detectChanges();
            expect(toggleFor("root/u1/m1").getAttribute("aria-expanded")).toBe(
                "false",
            );
            expect(toggleFor("root/u2/m1").getAttribute("aria-expanded")).toBe(
                "false",
            );
            const shared = (id: string) =>
                view.tree[0].children
                    .flatMap((u) => u.children)
                    .find((n) => n.id === id)!;
            expect(shared("root/u1/m1").expanded).toBe(false);
            expect(shared("root/u2/m1").expanded).toBeFalsy();
        });
    });
});
