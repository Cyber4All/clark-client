import { ComponentFixture, TestBed } from "@angular/core/testing";
import { LearningObject } from "@entity";
import { AuthService } from "app/core/auth-module/auth.service";
import { SearchService } from "app/core/learning-object-module/search/search.service";
import { BuilderStore } from "../../../builder-store.service";
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
    const createdChild = {
        id: "created-child-id",
        cuid: "created-child-cuid",
        version: 1,
        name: "Parent Child #2",
        length: LearningObject.Length.MICROMODULE,
        status: LearningObject.Status.UNRELEASED,
    } as LearningObject;
    const refreshedChildren = [draftChild, releasedChild, createdChild];
    const store = {
        isLearningObjectNameAvailable: jest.fn().mockResolvedValue(true),
        createHierarchyChild: jest.fn().mockResolvedValue(createdChild),
        attachHierarchyChild: jest.fn().mockResolvedValue(undefined),
        getChildren: jest.fn().mockResolvedValue(refreshedChildren),
    };
    const auth = {
        user: {
            id: "author-id",
            username: "author",
            name: "Author",
        },
    };

    function makeChildWindow(): Window {
        return {
            opener: window,
            document: {
                title: "",
                body: { textContent: "" },
            },
            location: { href: "" },
            close: jest.fn(),
        } as unknown as Window;
    }

    beforeEach(async () => {
        jest.clearAllMocks();

        await TestBed.configureTestingModule({
            imports: [AddChildComponent],
            providers: [
                { provide: SearchService, useValue: searchService },
                { provide: BuilderStore, useValue: store },
                { provide: AuthService, useValue: auth },
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

    afterEach(() => {
        jest.restoreAllMocks();
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
        expect(store.createHierarchyChild).not.toHaveBeenCalled();
    });

    it("creates, attaches, refreshes, and opens a new child in order", async () => {
        const childWindow = makeChildWindow();
        jest.spyOn(window, "open").mockReturnValue(childWindow);
        const hierarchyUpdates = [];
        component.childCreated.subscribe((result) =>
            hierarchyUpdates.push(result),
        );
        component.selectMode("create");

        await component.createNewChild();

        expect(store.isLearningObjectNameAvailable).toHaveBeenCalledWith(
            "Parent Child #2",
        );
        expect(store.createHierarchyChild).toHaveBeenCalledWith(
            expect.objectContaining({
                name: "Parent Child #2",
                length: LearningObject.Length.MICROMODULE,
                status: LearningObject.Status.UNRELEASED,
            }),
        );
        expect(store.attachHierarchyChild).toHaveBeenCalledWith(
            "created-child-id",
        );
        expect(store.getChildren).toHaveBeenCalled();
        expect(hierarchyUpdates).toEqual([
            { child: createdChild, children: refreshedChildren },
        ]);
        expect(childWindow.location.href).toContain(
            "/onion/learning-object-builder/created-child-cuid/1",
        );
        expect(component.creatingChild).toBe(false);
    });

    it("does not create a child when its name is unavailable", async () => {
        store.isLearningObjectNameAvailable.mockResolvedValueOnce(false);
        const childWindow = makeChildWindow();
        jest.spyOn(window, "open").mockReturnValue(childWindow);

        await component.createNewChild();

        expect(store.createHierarchyChild).not.toHaveBeenCalled();
        expect(store.attachHierarchyChild).not.toHaveBeenCalled();
        expect(childWindow.close).toHaveBeenCalled();
        expect(component.createChildError).toContain("already exists");
    });

    it("does not attach when child creation fails", async () => {
        store.createHierarchyChild.mockRejectedValueOnce(
            new Error("create failed"),
        );
        const childWindow = makeChildWindow();
        jest.spyOn(window, "open").mockReturnValue(childWindow);

        await component.createNewChild();

        expect(store.attachHierarchyChild).not.toHaveBeenCalled();
        expect(store.getChildren).not.toHaveBeenCalled();
        expect(component.createdChild).toBeUndefined();
        expect(component.createChildError).toContain(
            "could not be created",
        );
        expect(childWindow.close).toHaveBeenCalled();
    });

    it("retains a created child and retries only attachment after attach fails", async () => {
        store.attachHierarchyChild.mockRejectedValueOnce(
            new Error("attach failed"),
        );
        const initialWindow = makeChildWindow();
        const retryWindow = makeChildWindow();
        jest.spyOn(window, "open")
            .mockReturnValueOnce(initialWindow)
            .mockReturnValueOnce(retryWindow);
        const hierarchyUpdates = [];
        component.childCreated.subscribe((result) =>
            hierarchyUpdates.push(result),
        );

        await component.createNewChild();

        expect(component.createdChild).toBe(createdChild);
        expect(component.creationStage).toBe("attachFailed");
        expect(component.createChildError).toContain(
            "was created but could not be attached",
        );
        expect(initialWindow.close).toHaveBeenCalled();
        expect(store.getChildren).not.toHaveBeenCalled();

        await component.retryAttach();

        expect(store.createHierarchyChild).toHaveBeenCalledTimes(1);
        expect(store.attachHierarchyChild).toHaveBeenCalledTimes(2);
        expect(store.getChildren).toHaveBeenCalledTimes(1);
        expect(hierarchyUpdates).toEqual([
            { child: createdChild, children: refreshedChildren },
        ]);
        expect(retryWindow.location.href).toContain(
            "/onion/learning-object-builder/created-child-cuid/1",
        );
    });

    it("retries only hierarchy refresh after attach succeeds", async () => {
        store.getChildren.mockRejectedValueOnce(new Error("refresh failed"));
        const childWindow = makeChildWindow();
        jest.spyOn(window, "open").mockReturnValue(childWindow);
        const hierarchyUpdates = [];
        component.childCreated.subscribe((result) =>
            hierarchyUpdates.push(result),
        );

        await component.createNewChild();

        expect(component.createdChild).toBe(createdChild);
        expect(component.creationStage).toBe("refreshFailed");
        expect(component.createChildError).toContain(
            "created and attached",
        );
        expect(childWindow.location.href).toContain(
            "/onion/learning-object-builder/created-child-cuid/1",
        );

        await component.retryRefresh();

        expect(store.createHierarchyChild).toHaveBeenCalledTimes(1);
        expect(store.attachHierarchyChild).toHaveBeenCalledTimes(1);
        expect(store.getChildren).toHaveBeenCalledTimes(2);
        expect(hierarchyUpdates).toEqual([
            { child: createdChild, children: refreshedChildren },
        ]);
    });

    it("prevents duplicate submissions while creation is in progress", async () => {
        let resolveNameAvailability: (available: boolean) => void;
        store.isLearningObjectNameAvailable.mockReturnValueOnce(
            new Promise((resolve) => {
                resolveNameAvailability = resolve;
            }),
        );
        jest.spyOn(window, "open").mockReturnValue(makeChildWindow());

        const firstSubmission = component.createNewChild();
        const duplicateSubmission = component.createNewChild();

        expect(store.isLearningObjectNameAvailable).toHaveBeenCalledTimes(1);
        resolveNameAvailability(true);
        await Promise.all([firstSubmission, duplicateSubmission]);

        expect(store.createHierarchyChild).toHaveBeenCalledTimes(1);
        expect(store.attachHierarchyChild).toHaveBeenCalledTimes(1);
    });
});
