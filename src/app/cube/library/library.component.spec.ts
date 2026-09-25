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
import { FileService } from "app/core/learning-object-module/file/file.service";
import { of } from "rxjs";

describe("LibraryComponent", () => {
    let component: LibraryComponent;
    let fixture: ComponentFixture<LibraryComponent>;
    let libraryService: {
        getDownloadHistory: jest.Mock;
    };
    let learningObjectService: {
        getLearningObject: jest.Mock;
        fetchLearningObjectResources: jest.Mock;
    };
    let router: {
        navigate: jest.Mock;
    };
    let fileService: {
        handleFileDownload: jest.Mock;
    };

    const downloadedMaterial = {
        _id: "file-id",
        name: "attack-defense-lab.pdf",
    };

    const historyItem: DownloadHistoryItem = {
        name: "attack-defense-lab.pdf",
        title: "Introduction to Cyber Attacks and Defenses",
        fileName: "attack-defense-lab.pdf",
        filePath: "Nanomodule 1 / Labs / attack-defense-lab.pdf",
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
            fetchLearningObjectResources: jest.fn().mockReturnValue(
                of({
                    name: "materials",
                    data: { files: [downloadedMaterial] },
                }),
            ),
            getLearningObject: jest.fn().mockResolvedValue({
                author: { username: "alice" },
                id: historyItem.resource!.learningObjectId,
                cuid: historyItem.resource!.cuid,
                length: "micromodule",
                name: "Introduction to Cyber Attacks and Defenses",
                materials: { files: [downloadedMaterial] },
                version: historyItem.resource!.version,
            }),
        };
        fileService = {
            handleFileDownload: jest.fn().mockResolvedValue(""),
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
                    provide: FileService,
                    useValue: fileService,
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
            "Introduction to Cyber Attacks and Defenses",
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

    it("shows a loading state while download history is requested", async () => {
        let resolveHistory!: (value: { items: DownloadHistoryItem[] }) => void;
        libraryService.getDownloadHistory.mockReturnValueOnce(
            new Promise((resolve) => {
                resolveHistory = resolve;
            }),
        );

        fixture = TestBed.createComponent(LibraryComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        expect(fixture.nativeElement.textContent).toContain(
            "Loading your download history...",
        );

        resolveHistory({ items: [] });
        await fixture.whenStable();
        fixture.detectChanges();

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
        fixture.ngZone!.run(() =>
            retryButton.triggerEventHandler("activate", {}),
        );
        await fixture.whenStable();
        fixture.detectChanges();

        expect(libraryService.getDownloadHistory).toHaveBeenCalledTimes(2);
        expect(fixture.nativeElement.textContent).toContain(
            "Introduction to Cyber Attacks and Defenses",
        );
    });

    it("loads more history with the next cursor", async () => {
        const nextItem = {
            ...historyItem,
            downloadedAt: "2025-07-10T21:04:27.612000Z",
            name: "older-download.pdf",
            fileName: "older-download.pdf",
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
        fixture.ngZone!.run(() => component.loadMore());
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

    it("does not render unavailable resources", async () => {
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
            "No downloads in your history yet.",
        );
        expect(
            fixture.debugElement.query(By.css(".download-history-table")),
        ).toBeNull();
        expect(
            fixture.debugElement.query(By.css(".download-history-file-name")),
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

        expect(headers).toEqual([
            "Length",
            "Type",
            "Title",
            "File Name",
            "Downloaded",
        ]);
        expect(fixture.debugElement.query(By.css(".fa-file"))).not.toBeNull();
        expect(
            fixture.debugElement.query(
                By.css(".library-item__download-button"),
            ),
        ).toBeNull();
    });

    it("shows a bundle icon and no file name for bundle downloads", async () => {
        const bundleTitle = "Cybersecurity Module 6 - Cryptography";
        libraryService.getDownloadHistory.mockResolvedValueOnce({
            items: [
                {
                    ...historyItem,
                    name: bundleTitle,
                    title: bundleTitle,
                    fileName: undefined,
                    filePath: undefined,
                    type: "bundle",
                },
            ],
        });

        await createComponent();

        expect(fixture.nativeElement.textContent).toContain("Bundle");
        expect(fixture.nativeElement.textContent).toContain("—");
        expect(
            fixture.debugElement.query(By.css(".fa-layer-group")),
        ).not.toBeNull();
        const cells = fixture.debugElement.queryAll(
            By.css(".download-history-table__row [role=cell]"),
        );
        expect(cells[3].nativeElement.textContent.trim()).toBe("—");
        expect(cells[3].nativeElement.textContent).not.toContain(bundleTitle);
        expect(
            fixture.debugElement.query(By.css(".download-history-file-name")),
        ).toBeNull();
    });

    it("downloads an available file through the authorized file service", async () => {
        await createComponent();

        const fileButton = fixture.debugElement.query(
            By.css(".download-history-file-name"),
        );
        expect(fileButton.nativeElement.classList).toContain(
            "library-item__title-button",
        );
        fileButton.triggerEventHandler("click", new MouseEvent("click"));
        await fixture.whenStable();

        expect(fileService.handleFileDownload).toHaveBeenCalledWith(
            downloadedMaterial,
            expect.objectContaining({ id: "learning-object-id" }),
        );
        expect(
            JSON.stringify(fileService.handleFileDownload.mock.calls[0]),
        ).not.toContain(historyItem.filePath);
    });

    it("shows an em dash for a File record without a fileName", async () => {
        libraryService.getDownloadHistory.mockResolvedValueOnce({
            items: [{ ...historyItem, fileName: undefined }],
        });

        await createComponent();

        const cells = fixture.debugElement.queryAll(
            By.css(".download-history-table__row [role=cell]"),
        );
        expect(cells[3].nativeElement.textContent.trim()).toBe("—");
        expect(
            fixture.debugElement.query(By.css(".download-history-file-name")),
        ).toBeNull();
    });

    it("loads separate materials before enabling the filename download", async () => {
        learningObjectService.getLearningObject.mockResolvedValueOnce({
            id: historyItem.resource!.learningObjectId,
            length: "module",
            name: historyItem.title,
            resourceUris: {
                materials: "/learning-objects/learning-object-id/materials",
            },
            materials: { files: [] },
        });

        await createComponent();

        expect(
            learningObjectService.fetchLearningObjectResources,
        ).toHaveBeenCalledWith(
            expect.objectContaining({ id: "learning-object-id" }),
            ["materials"],
        );
        const button = fixture.debugElement.query(
            By.css(".download-history-file-name"),
        );
        expect(button).not.toBeNull();
        button.nativeElement.click();
        await fixture.whenStable();
        expect(fileService.handleFileDownload).toHaveBeenCalledWith(
            downloadedMaterial,
            expect.objectContaining({ id: "learning-object-id" }),
        );
    });

    it("keeps filenames non-clickable when the materials request fails", async () => {
        learningObjectService.getLearningObject.mockResolvedValueOnce({
            length: "module",
            resourceUris: { materials: "/materials" },
            materials: { files: [] },
        });
        learningObjectService.fetchLearningObjectResources.mockReturnValueOnce(
            of({ name: "materials", data: { status: 403 } }),
        );
        await createComponent();
        expect(fixture.nativeElement.textContent).toContain(
            historyItem.fileName,
        );
        expect(
            fixture.debugElement.query(By.css(".download-history-file-name")),
        ).toBeNull();
        expect(fileService.handleFileDownload).not.toHaveBeenCalled();
    });

    it("does not make a File row clickable when its material no longer exists", async () => {
        learningObjectService.getLearningObject.mockResolvedValueOnce({
            author: { username: "alice" },
            id: historyItem.resource!.learningObjectId,
            cuid: historyItem.resource!.cuid,
            length: "micromodule",
            materials: { files: [] },
            name: "Introduction to Cyber Attacks and Defenses",
            version: historyItem.resource!.version,
        });

        await createComponent();

        expect(fixture.nativeElement.textContent).toContain(
            "attack-defense-lab.pdf",
        );
        expect(
            fixture.debugElement.query(By.css(".download-history-file-name")),
        ).toBeNull();
        expect(fileService.handleFileDownload).not.toHaveBeenCalled();
    });

    it("derives a short file name while retaining the full inline path", async () => {
        await createComponent();

        expect(component.getFileName(historyItem)).toBe(
            "attack-defense-lab.pdf",
        );
        expect(component.getFilePath(component.downloadHistoryItems[0])).toBe(
            "Nanomodule 1 / Labs / attack-defense-lab.pdf",
        );
        expect(
            fixture.debugElement
                .query(By.css(".download-history-file-name"))
                .nativeElement.getAttribute("aria-label"),
        ).toBe("Download attack-defense-lab.pdf");
    });
});
