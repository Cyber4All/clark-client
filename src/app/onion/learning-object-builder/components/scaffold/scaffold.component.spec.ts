import { ComponentFixture, TestBed } from "@angular/core/testing";
import { LearningObject } from "@entity";
import { UriRetrieverService } from "app/core/learning-object-module/uri-retriever.service";
import { BuilderStore } from "../../builder-store.service";
import { ScaffoldComponent } from "./scaffold.component";

describe("ScaffoldComponent", () => {
    let fixture: ComponentFixture<ScaffoldComponent>;
    let component: ScaffoldComponent;

    const children = [
        {
            id: "child-id",
            name: "Parent Child #1",
            length: LearningObject.Length.MICROMODULE,
            date: "2026-07-24T00:00:00.000Z",
        } as LearningObject,
    ];
    const store = {
        getChildren: jest.fn().mockResolvedValue(children),
        setChildren: jest.fn().mockResolvedValue(undefined),
        fetch: jest.fn().mockResolvedValue(undefined),
    };

    async function createComponent(
        length: LearningObject.Length,
        id = "parent-id",
    ): Promise<void> {
        fixture = TestBed.createComponent(ScaffoldComponent);
        component = fixture.componentInstance;
        component.learningObject = {
            id,
            cuid: "parent-cuid",
            version: 1,
            name: "Parent",
            length,
        } as LearningObject;

        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
    }

    beforeEach(async () => {
        jest.clearAllMocks();
        store.getChildren.mockResolvedValue(children);

        await TestBed.configureTestingModule({
            imports: [ScaffoldComponent],
            providers: [
                { provide: BuilderStore, useValue: store },
                { provide: UriRetrieverService, useValue: {} },
            ],
        }).compileComponents();
    });

    it("shows a persistent Add Child action without an Add/Delete toggle", async () => {
        await createComponent(LearningObject.Length.MODULE);
        const element = fixture.nativeElement as HTMLElement;

        const addChildButton =
            element.querySelector<HTMLButtonElement>(".edit-children");

        expect(addChildButton).toBeTruthy();
        expect(addChildButton.disabled).toBe(false);
        expect(element.querySelector("clark-toggle-switch")).toBeNull();
    });

    it("disables Add Child and explains why for a Nanomodule", async () => {
        await createComponent(LearningObject.Length.NANOMODULE);
        const element = fixture.nativeElement as HTMLElement;

        const addChildButton =
            element.querySelector<HTMLButtonElement>(".edit-children");

        expect(addChildButton.disabled).toBe(true);
        expect(addChildButton.getAttribute("aria-label")).toContain(
            "Nanomodules cannot have children",
        );
        expect(element.querySelector(".no-children").textContent).toContain(
            "Nanomodules cannot have children",
        );
        expect(store.getChildren).not.toHaveBeenCalled();
    });

    it("keeps the reorder handle left of the name and delete action on the right", async () => {
        await createComponent(LearningObject.Length.MODULE);
        const element = fixture.nativeElement as HTMLElement;

        const row = element.querySelector(".child-box");
        const rowControls = Array.from(row.children).map(
            (element: HTMLElement) => element.className,
        );

        expect(rowControls).toEqual([
            "hamburger-handle",
            "info",
            "delete",
        ]);
    });

    it("disables Add Child until the parent has been created", async () => {
        await createComponent(LearningObject.Length.MODULE, "");
        const element = fixture.nativeElement as HTMLElement;

        const addChildButton =
            element.querySelector<HTMLButtonElement>(".edit-children");

        expect(addChildButton.disabled).toBe(true);
        expect(addChildButton.getAttribute("aria-label")).toContain(
            "Name this learning object before adding children",
        );
    });

    it("keeps the popup open while a child operation requires recovery", async () => {
        await createComponent(LearningObject.Length.MODULE);
        component.isAddingChild = true;
        component.childFlowLocked = true;

        component.toggleAddChild(false);

        expect(component.isAddingChild).toBe(true);
    });
});
