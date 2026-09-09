import { waitForAsync, ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import {
    DownloadHistoryItem,
    LibraryService,
} from "app/core/library-module/library.service";
import { NavbarService } from "app/core/client-module/navbar.service";
import { ToastrOvenService } from "app/shared/modules/toaster/notification.service";
import { LibraryComponent } from "./library.component";
import { LearningObjectService } from "app/core/learning-object-module/learning-object/learning-object.service";
import { Router } from "@angular/router";

describe("LibraryComponent", () => {
    let component: LibraryComponent;
    let fixture: ComponentFixture<LibraryComponent>;
    let libraryService: {
        getDownloadHistory: jest.Mock;
    };
    let learningObjectService: {
        getLearningObject: jest.Mock;
    };
    let router: {
        navigate: jest.Mock;
    };

    const historyItem: DownloadHistoryItem = {
        name: "10.CAS_Unit4_Scenario2_Presentation.pptx",
        downloadedAt: "2025-07-11T21:04:27.612000Z",
        downloadedBy: "5dd599c7fa53ebc86eb8b5cf",
        type: "file",
        available: true,
        resource: {
            learningObjectId: "learning-object-id",
            cuid: "136c63fd-cfd6-48f5-bdb3-9600f28079c8",
            version: 0,
        },
    };

    async function createComponent() {
        fixture = TestBed.createComponent(LibraryComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
    }

    beforeEach(waitForAsync(() => {
        libraryService = {
            getDownloadHistory: jest.fn().mockResolvedValue({
                items: [historyItem],
                nextCursor: "cursor-2",
            }),
        };
        learningObjectService = {
            getLearningObject: jest.fn().mockResolvedValue({
                author: { username: "alice" },
                cuid: historyItem.resource!.cuid,
                length: "micromodule",
                version: historyItem.resource!.version,
            }),
        };
        router = {
            navigate: jest.fn().mockResolvedValue(true),
        };

        TestBed.configureTestingModule({
            imports: [LibraryComponent],
            providers: [
                {
                    provide: LibraryService,
                    useValue: libraryService,
                },
                {
                    provide: LearningObjectService,
                    useValue: learningObjectService,
                },
                {
                    provide: Router,
                    useValue: router,
                },
                {
                    provide: NavbarService,
                    useValue: {
                        show: jest.fn(),
                    },
                },
                {
                    provide: ToastrOvenService,
                    useValue: {
                        error: jest.fn(),
                    },
                },
            ],
            teardown: { destroyAfterEach: false },
        }).compileComponents();
    }));

    it("should create", async () => {
        await createComponent();

        expect(component).toBeTruthy();
    });

    it("renders download history rows", async () => {
        await createComponent();

        expect(fixture.nativeElement.textContent).toContain("Download History");
        expect(fixture.nativeElement.textContent).toContain(
            "10.CAS_Unit4_Scenario2_Presentation.pptx",
        );
        expect(fixture.nativeElement.textContent).toContain("Micromodule");
    });

    it("shows the empty state", async () => {
        libraryService.getDownloadHistory.mockResolvedValueOnce({ items: [] });

        await createComponent();

        expect(fixture.nativeElement.textContent).toContain(
            "No downloads in your history yet.",
        );
    });

    it("shows an error state with retry", async () => {
        libraryService.getDownloadHistory
            .mockRejectedValueOnce(new Error("failed"))
            .mockResolvedValueOnce({ items: [historyItem] });

        await createComponent();

        expect(fixture.nativeElement.textContent).toContain(
            "Unable to load your download history.",
        );

        const retryButton = fixture.debugElement.query(By.css(".button.good"));
        retryButton.triggerEventHandler("activate", {});
        await fixture.whenStable();
        fixture.detectChanges();

        expect(libraryService.getDownloadHistory).toHaveBeenCalledTimes(2);
        expect(fixture.nativeElement.textContent).toContain(
            "10.CAS_Unit4_Scenario2_Presentation.pptx",
        );
    });

    it("loads more history with the next cursor", async () => {
        const nextItem = {
            ...historyItem,
            downloadedAt: "2025-07-10T21:04:27.612000Z",
            name: "older-download.pdf",
        };
        libraryService.getDownloadHistory
            .mockResolvedValueOnce({
                items: [historyItem],
                nextCursor: "cursor-2",
            })
            .mockResolvedValueOnce({
                items: [nextItem],
            });

        await createComponent();
        component.loadMore();
        await fixture.whenStable();
        fixture.detectChanges();

        expect(libraryService.getDownloadHistory).toHaveBeenLastCalledWith({
            limit: 20,
            cursor: "cursor-2",
        });
        expect(fixture.nativeElement.textContent).toContain(
            "older-download.pdf",
        );
    });

    it("shows unavailable resource state without an action", async () => {
        libraryService.getDownloadHistory.mockResolvedValueOnce({
            items: [
                {
                    ...historyItem,
                    available: false,
                    resource: null,
                },
            ],
        });

        await createComponent();

        expect(fixture.nativeElement.textContent).toContain(
            "This resource is no longer available or you no longer have access.",
        );
        expect(
            fixture.debugElement.query(By.css(".library-item__title-button")),
        ).toBeNull();
    });

    it("navigates to the learning object details page for available rows", async () => {
        await createComponent();

        await component.goToItem(new MouseEvent("click"), historyItem);

        expect(learningObjectService.getLearningObject).toHaveBeenCalledWith(
            historyItem.resource!.cuid,
            historyItem.resource!.version,
        );
        expect(router.navigate).toHaveBeenCalledWith([
            "/details",
            "alice",
            historyItem.resource!.cuid,
            historyItem.resource!.version,
        ]);
    });

    it("does not show stars or download action columns", async () => {
        await createComponent();

        const headers = fixture.debugElement
            .queryAll(By.css(".download-history-table__header div"))
            .map((header) => header.nativeElement.textContent.trim());

        expect(headers).toEqual(["Type", "Course", "Downloaded"]);
        expect(
            fixture.debugElement.query(
                By.css(".library-item__download-button"),
            ),
        ).toBeNull();
    });
});
