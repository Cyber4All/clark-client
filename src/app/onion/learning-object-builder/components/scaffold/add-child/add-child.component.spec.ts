import { ComponentFixture, TestBed } from "@angular/core/testing";
import { LearningObject } from "@entity";
import { AuthService } from "app/core/auth-module/auth.service";
import { SearchService } from "app/core/learning-object-module/search/search.service";
import { AddChildComponent } from "./add-child.component";

describe("AddChildComponent", () => {
    let fixture: ComponentFixture<AddChildComponent>;
    let component: AddChildComponent;

    const draftChild = {
        id: "draft-child-id",
        name: "Draft Child",
        length: LearningObject.Length.MICROMODULE,
    } as LearningObject;
    const releasedChild = {
        id: "released-child-id",
        name: "Released Child",
        length: LearningObject.Length.NANOMODULE,
    } as LearningObject;
    const searchService = {
        getUsersLearningObjects: jest.fn(
            (_username: string, filters: { draftsOnly?: boolean }) =>
                Promise.resolve({
                    learningObjects: filters.draftsOnly
                        ? [draftChild]
                        : [releasedChild],
                    total: 1,
                }),
        ),
    };

    beforeEach(async () => {
        jest.clearAllMocks();

        await TestBed.configureTestingModule({
            imports: [AddChildComponent],
            providers: [
                { provide: SearchService, useValue: searchService },
                { provide: AuthService, useValue: {} },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(AddChildComponent);
        component = fixture.componentInstance;
        component.child = {
            name: "Parent",
            length: LearningObject.Length.MODULE,
            author: { username: "author" },
        } as LearningObject;
        component.currentChildren = ["existing-child-id"];

        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
    });

    it("starts with the existing-child search path", () => {
        const element = fixture.nativeElement as HTMLElement;

        expect(component.mode).toBe("existing");
        expect(element.querySelector("#existingChildPanel")).toBeTruthy();
        expect(element.querySelector("#childrenSearch")).toBeTruthy();
    });

    it("switches between Create New and Add Existing paths", () => {
        const element = fixture.nativeElement as HTMLElement;

        component.selectMode("create");
        fixture.detectChanges();

        expect(element.querySelector("#createChildPanel")).toBeTruthy();
        expect(element.querySelector("#existingChildPanel")).toBeNull();

        component.selectMode("existing");
        fixture.detectChanges();

        expect(element.querySelector("#existingChildPanel")).toBeTruthy();
    });

    it("provides an editable default name and one-level-shorter length", () => {
        component.selectMode("create");
        fixture.detectChanges();
        const element = fixture.nativeElement as HTMLElement;
        const nameInput =
            element.querySelector<HTMLInputElement>("#newChildName");

        expect(component.newChildName).toBe("Parent Child #2");
        expect(component.defaultChildLength).toBe(
            LearningObject.Length.MICROMODULE,
        );
        expect(nameInput.value).toBe("Parent Child #2");
        expect(nameInput.readOnly).toBe(false);
    });

    it("keeps both draft and released objects available to attach", () => {
        expect(component.children).toEqual([draftChild, releasedChild]);
        expect(searchService.getUsersLearningObjects).toHaveBeenCalledWith(
            "author",
            expect.objectContaining({ draftsOnly: true }),
        );
        expect(searchService.getUsersLearningObjects).toHaveBeenCalledWith(
            "author",
            expect.not.objectContaining({ draftsOnly: true }),
        );
    });

    it("emits an existing child without invoking a create operation", () => {
        const emittedChildren: LearningObject[] = [];
        component.childToAdd.subscribe((child: LearningObject) =>
            emittedChildren.push(child),
        );
        component.children = [releasedChild];

        component.addChildToList(releasedChild, 0);

        expect(emittedChildren).toEqual([releasedChild]);
        expect(component.children).toEqual([]);
    });
});
