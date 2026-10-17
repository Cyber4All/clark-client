import { BehaviorSubject, Subject } from "rxjs";
import { ActionPanelComponent } from "./action-panel.component";

describe("ActionPanelComponent lifecycle", () => {
    let resolveLibrary: () => void;
    let libraryService: any;
    let collectionService: any;
    let dropdowns: any;
    let component: ActionPanelComponent;

    beforeEach(() => {
        libraryService = {
            loaded: new BehaviorSubject<boolean>(false),
            getLibrary: jest.fn(
                () =>
                    new Promise<void>((resolve) => {
                        resolveLibrary = resolve;
                    }),
            ),
            has: jest.fn(() => false),
        };
        collectionService = {
            getCollection: jest.fn(() => Promise.resolve({ name: "test" })),
        };
        dropdowns = { userDropdown: new BehaviorSubject<boolean>(false) };
        const auth: any = {
            username: "someone",
            user: null,
            group: new Subject<void>(),
            hasEditorAccess: () => false,
            hasReviewerAccess: () => false,
        };
        const changeDetectorRef: any = {
            markForCheck: jest.fn(),
            detectChanges: jest.fn(),
        };

        component = new ActionPanelComponent(
            auth,
            libraryService,
            {} as any,
            {} as any,
            changeDetectorRef,
            collectionService,
            {} as any,
            dropdowns,
            {} as any,
            {} as any,
        );
        component.learningObject = {
            author: { username: "author" },
            status: "released",
            cuid: "cuid",
            version: 0,
            id: "id",
            collection: "collection",
        } as any;
        jest.spyOn(component as any, "buildLocation").mockReturnValue("url");
    });

    it("does not throw when destroyed while the library request is pending", async () => {
        const init = component.ngOnInit();
        component.ngOnDestroy();
        resolveLibrary();

        await expect(init).resolves.toBeUndefined();
        expect(collectionService.getCollection).not.toHaveBeenCalled();
    });

    it("tears down subscriptions on destroy", async () => {
        const init = component.ngOnInit();
        resolveLibrary();
        await init;

        component.ngOnDestroy();
        libraryService.loaded.next(true);
        expect(component.downloading).toBe(false);
    });
});
