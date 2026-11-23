import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { FileService } from "./file.service";
import { LearningObject } from "@entity";
import { BehaviorSubject, of, Subject, Subscription, throwError } from "rxjs";
import type {
    FileContentProcessingStatus,
    FileProcessingStatusResponse,
} from "./file-processing-status.types";
import { FILE_METADATA_ROUTES } from "./file.routes";

describe("FileService explorer operations", () => {
    const learningObjectId = "507f1f77bcf86cd799439011";
    const fileId = "507f1f77bcf86cd799439012";
    let patch: jest.Mock;
    let service: FileService;

    beforeEach(() => {
        patch = jest.fn(() => of(undefined));
        service = new FileService({ patch } as unknown as HttpClient);
    });

    it("renames a file through the authenticated rename endpoint", async () => {
        await service
            .renameFile(learningObjectId, fileId, "guide.pdf")
            .toPromise();

        expect(patch).toHaveBeenCalledWith(
            FILE_METADATA_ROUTES.RENAME_LEARNING_OBJECT_FILE(
                learningObjectId,
                fileId,
            ),
            { name: "guide.pdf" },
            expect.objectContaining({ withCredentials: true }),
        );
    });

    it("moves a file through the authenticated move endpoint", async () => {
        await service
            .moveFile(learningObjectId, fileId, "unit-one")
            .toPromise();

        expect(patch).toHaveBeenCalledWith(
            FILE_METADATA_ROUTES.MOVE_LEARNING_OBJECT_FILE(
                learningObjectId,
                fileId,
            ),
            { destinationPath: "unit-one" },
            expect.objectContaining({ withCredentials: true }),
        );
    });

    it("renames a folder through the authenticated folder endpoint", async () => {
        await service
            .renameFolder(learningObjectId, "old/unit", "lesson")
            .toPromise();

        expect(patch).toHaveBeenCalledWith(
            FILE_METADATA_ROUTES.RENAME_LEARNING_OBJECT_FOLDER(
                learningObjectId,
            ),
            { path: "old/unit", name: "lesson" },
            expect.objectContaining({ withCredentials: true }),
        );
    });

    it("passes service failures to the caller", (done) => {
        patch.mockReturnValue(throwError(new Error("service unavailable")));

        service.renameFile(learningObjectId, fileId, "guide.pdf").subscribe({
            error: (error) => {
                expect(error.message).toBe("service unavailable");
                done();
            },
        });
    });
});

describe("FileService previews", () => {
    let service: FileService;
    let openSpy: jest.SpyInstance;

    beforeEach(() => {
        service = new FileService({} as HttpClient);
        openSpy = jest.spyOn(window, "open").mockImplementation(() => null);
    });

    afterEach(() => {
        openSpy.mockRestore();
    });

    it.each(["lesson.ipynb", "LESSON.IPYNB"])(
        "allows %s to be previewed",
        (fileName) => {
            expect(FileService.canPreview(fileName)).toBe(true);
        },
    );

    it("opens notebooks in notebook mode in the shared preview route", async () => {
        const url = "https://files.example.com/lesson.ipynb?token=signed-value";

        await service.previewLearningObjectFile(url, "lesson.ipynb");

        expect(openSpy).toHaveBeenCalledWith(
            `/preview/code?url=${encodeURIComponent(url)}&type=notebook&filename=lesson.ipynb`,
            "_blank",
            "noopener,noreferrer",
        );
    });
});

describe("FileService AI material readiness", () => {
    const fileId = "507f1f77bcf86cd799439011";
    let service: FileService;
    let get: jest.Mock;
    let learningObject: LearningObject;
    let objects: BehaviorSubject<LearningObject>;
    let subscription: Subscription;
    let readiness: boolean[];

    const status = (
        processingStatus: FileContentProcessingStatus,
        storageRevision = 1,
    ): FileProcessingStatusResponse => ({
        fileId,
        storageRevision,
        processingStatus,
    });

    const watch = () => {
        subscription = service
            .watchAiMaterialReadiness(objects)
            .subscribe((ready) => readiness.push(ready));
        jest.advanceTimersByTime(0);
    };

    beforeEach(() => {
        jest.useFakeTimers();
        get = jest.fn(() => of(status("queued")));
        service = new FileService({ get } as unknown as HttpClient);
        learningObject = new LearningObject();
        learningObject.id = "507f1f77bcf86cd799439012";
        learningObject.materials.files = [
            {
                _id: fileId,
                storageRevision: 1,
                name: "lesson.pdf",
                extension: "pdf",
                fileType: "application/pdf",
                date: "2026-10-27",
            },
        ];
        objects = new BehaviorSubject(learningObject);
        readiness = [];
    });

    afterEach(() => {
        subscription?.unsubscribe();
        jest.useRealTimers();
    });

    it.each<FileContentProcessingStatus>([
        "queued",
        "processing",
        "failure",
        "cancelled",
        "not_started",
    ])("keeps generation disabled for status %s", (processingStatus) => {
        get.mockReturnValue(of(status(processingStatus)));
        watch();
        expect(readiness).toEqual([false]);
    });

    it.each<FileContentProcessingStatus>(["success", "partial_success"])(
        "enables generation only after status %s is confirmed",
        (processingStatus) => {
            get.mockReturnValue(of(status(processingStatus)));
            watch();
            expect(readiness).toEqual([false, true]);
            expect(get).toHaveBeenCalledWith(
                FILE_METADATA_ROUTES.GET_FILE_PROCESSING_STATUS(
                    learningObject.id,
                    fileId,
                ),
                expect.objectContaining({ withCredentials: true }),
            );
        },
    );

    it("polls queued files and stops once one succeeds", () => {
        get.mockReturnValueOnce(of(status("queued"))).mockReturnValue(
            of(status("success")),
        );
        watch();
        expect(readiness).toEqual([false]);
        jest.advanceTimersByTime(5000);
        expect(readiness).toEqual([false, true]);
        jest.advanceTimersByTime(15000);
        expect(get).toHaveBeenCalledTimes(2);
    });

    it("does not query unsupported files", () => {
        learningObject.materials.files[0].extension = "flac";
        watch();
        expect(readiness).toEqual([false]);
        expect(get).not.toHaveBeenCalled();
    });

    it("stays disabled on status errors", () => {
        get.mockReturnValue(throwError(new Error("Unavailable")));
        watch();
        expect(readiness).toEqual([false]);
    });

    it.each([400, 401, 403, 404, 410, 422])(
        "stops polling after a permanent HTTP %s response",
        (httpStatus) => {
            get.mockReturnValue(
                throwError(new HttpErrorResponse({ status: httpStatus })),
            );
            watch();
            jest.advanceTimersByTime(30000);
            expect(readiness).toEqual([false]);
            expect(get).toHaveBeenCalledTimes(1);
        },
    );

    it.each([0, 408, 429, 503])(
        "can recover from a transient HTTP %s response",
        (httpStatus) => {
            get.mockReturnValueOnce(
                throwError(new HttpErrorResponse({ status: httpStatus })),
            ).mockReturnValue(of(status("success")));
            watch();
            jest.advanceTimersByTime(5000);
            expect(readiness).toEqual([false, true]);
            expect(get).toHaveBeenCalledTimes(2);
        },
    );

    it("continues checking queued files without repeatedly querying a missing file", () => {
        const secondId = "507f1f77bcf86cd799439013";
        learningObject.materials.files.push({
            ...learningObject.materials.files[0],
            _id: secondId,
        });
        let secondFileChecks = 0;
        get.mockImplementation((url: string) => {
            if (url.includes(fileId)) {
                return throwError(new HttpErrorResponse({ status: 404 }));
            }
            return of({
                ...status(++secondFileChecks === 1 ? "queued" : "success"),
                fileId: secondId,
            });
        });
        watch();
        jest.advanceTimersByTime(5000);
        expect(readiness).toEqual([false, true]);
        expect(
            get.mock.calls.filter(([url]) => url.includes(fileId)),
        ).toHaveLength(1);
        expect(secondFileChecks).toBe(2);
    });

    it("checks again after a missing material is replaced with a new revision", () => {
        get.mockReturnValueOnce(
            throwError(new HttpErrorResponse({ status: 404 })),
        ).mockReturnValue(of(status("success", 2)));
        watch();
        jest.advanceTimersByTime(10000);
        expect(get).toHaveBeenCalledTimes(1);
        learningObject.materials.files[0].storageRevision = 2;
        objects.next(learningObject);
        jest.advanceTimersByTime(0);
        expect(readiness).toEqual([false, true]);
        expect(get).toHaveBeenCalledTimes(2);
    });

    it("disables immediately when the last supported file is removed", () => {
        get.mockReturnValue(of(status("success")));
        watch();
        learningObject.materials.files = [];
        objects.next(learningObject);
        expect(readiness).toEqual([false, true, false]);
    });

    it("cancels stale requests when a file is replaced with a new revision", () => {
        const previousRequest = new Subject<FileProcessingStatusResponse>();
        get.mockReturnValueOnce(previousRequest).mockReturnValue(
            of(status("queued", 2)),
        );
        watch();
        learningObject.materials.files[0].storageRevision = 2;
        objects.next(learningObject);
        previousRequest.next(status("success", 1));
        previousRequest.complete();
        jest.advanceTimersByTime(0);
        expect(readiness).toEqual([false]);
        expect(get).toHaveBeenCalledTimes(2);
    });

    it("does not accept a success response for an older storage revision", () => {
        get.mockReturnValue(of(status("success", 0)));
        watch();
        expect(readiness).toEqual([false]);
    });

    it("does not restart checks for unrelated learning-object changes", () => {
        watch();
        learningObject.name = "Updated name";
        objects.next(learningObject);
        jest.advanceTimersByTime(0);
        expect(get).toHaveBeenCalledTimes(1);
    });

    it("stops polling when its consumer unsubscribes", () => {
        watch();
        subscription.unsubscribe();
        jest.advanceTimersByTime(15000);
        expect(get).toHaveBeenCalledTimes(1);
    });
});
