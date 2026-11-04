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
});
