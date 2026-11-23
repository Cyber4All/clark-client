import { BehaviorSubject, of, Subject, throwError } from "rxjs";
import { LearningObject } from "@entity";
import {
    FileManagerComponent,
    validateMaterialName,
} from "./file-manager.component";

describe("FileManagerComponent explorer operations", () => {
    const learningObjectId = "507f1f77bcf86cd799439011";
    let component: FileManagerComponent;
    let fileService: {
        renameFile: jest.Mock;
        moveFile: jest.Mock;
        renameFolder: jest.Mock;
    };
    let toaster: { success: jest.Mock };
    let files$: BehaviorSubject<LearningObject.Material.File[]>;

    const material = (
        name: string,
        fullPath: string,
        id: string,
    ): LearningObject.Material.File => ({
        _id: id,
        name,
        fullPath,
        extension: name.split(".").pop(),
        fileType: "application/pdf",
        date: "2026-11-09",
    });

    beforeEach(() => {
        fileService = {
            renameFile: jest.fn(() => of(undefined)),
            moveFile: jest.fn(() => of(undefined)),
            renameFolder: jest.fn(() => of(undefined)),
        };
        toaster = { success: jest.fn() };
        files$ = new BehaviorSubject([
            material("guide.pdf", "unit/guide.pdf", "file-1"),
            material("existing.pdf", "archive/existing.pdf", "file-2"),
        ]);
        component = new FileManagerComponent(
            fileService as any,
            toaster as any,
        );
        component.learningObjectId = learningObjectId;
        component.files$ = files$;
        component.folderMeta$ = new BehaviorSubject([
            { path: "unit", description: "Unit files" },
        ]);
        component.ngOnInit();
    });

    afterEach(() => component.ngOnDestroy());

    it.each([
        ["", "guide.pdf", true, "A name is required."],
        ["bad/name.pdf", "guide.pdf", true, "invalid character"],
        ["guide.txt", "guide.pdf", true, "extension"],
        ["guide.pdf", "guide.pdf", true, "different name"],
    ])("validates rename value %p", (name, original, isFile, message) => {
        expect(validateMaterialName(name, original, isFile)).toContain(message);
    });

    it("cancels without calling a service", () => {
        component.menuItem = files$.value[0];
        component.operation = "rename";

        component.cancelOperation();

        expect(component.operation).toBeUndefined();
        expect(fileService.renameFile).not.toHaveBeenCalled();
        expect(fileService.moveFile).not.toHaveBeenCalled();
    });

    it("prevents native form submission before renaming", () => {
        component.menuItem = files$.value[0];
        component.operation = "rename";
        component.operationControl.setValue("lesson.pdf");
        const event = { preventDefault: jest.fn() } as unknown as SubmitEvent;

        component.submitOperation(event);

        expect(event.preventDefault).toHaveBeenCalled();
        expect(fileService.renameFile).toHaveBeenCalledWith(
            learningObjectId,
            "file-1",
            "lesson.pdf",
        );
    });

    it("preserves the selected item when the context menu closes behind the rename dialog", () => {
        const selectedFile = files$.value[0];
        component.menuItem = selectedFile;

        component.openOperation("rename");
        component.closeContextMenu();

        expect(component.menuItem).toBe(selectedFile);
    });

    it("reports a stale selection instead of throwing during rename", async () => {
        component.operation = "rename";
        component.menuItem = undefined;

        await component.submitRename();

        expect(component.operationError).toContain("no longer available");
        expect(fileService.renameFile).not.toHaveBeenCalled();
    });

    it("renames a file and refreshes its path", async () => {
        component.menuItem = files$.value[0];
        component.operationControl.setValue("lesson.pdf");

        await component.submitRename();

        expect(fileService.renameFile).toHaveBeenCalledWith(
            learningObjectId,
            "file-1",
            "lesson.pdf",
        );
        expect(files$.value[0]).toEqual(
            expect.objectContaining({
                name: "lesson.pdf",
                fullPath: "unit/lesson.pdf",
            }),
        );
        expect(toaster.success).toHaveBeenCalled();
    });

    it("shows loading feedback until a rename finishes", async () => {
        const request = new Subject<void>();
        fileService.renameFile.mockReturnValue(request);
        component.menuItem = files$.value[0];
        component.operationControl.setValue("lesson.pdf");

        const submission = component.submitRename();

        expect(component.operationLoading).toBe(true);
        request.next();
        request.complete();
        await submission;
        expect(component.operationLoading).toBe(false);
    });

    it("ignores repeated rename submissions while one is pending", async () => {
        const request = new Subject<void>();
        fileService.renameFile.mockReturnValue(request);
        component.menuItem = files$.value[0];
        component.operation = "rename";
        component.operationControl.setValue("lesson.pdf");
        const event = { preventDefault: jest.fn() } as unknown as SubmitEvent;

        component.submitOperation(event);
        component.submitOperation(event);
        const directSubmission = component.submitRename();

        expect(fileService.renameFile).toHaveBeenCalledTimes(1);
        request.next();
        request.complete();
        await directSubmission;
    });

    it("rejects an unchanged move", async () => {
        component.menuItem = files$.value[0];
        component.operationControl.setValue("unit");

        await component.submitMove();

        expect(component.operationError).toContain("different destination");
        expect(fileService.moveFile).not.toHaveBeenCalled();
    });

    it("rejects a duplicate move destination", async () => {
        files$.next([
            ...files$.value,
            material("guide.pdf", "archive/guide.pdf", "file-3"),
        ]);
        component.menuItem = files$.value[0];
        component.operationControl.setValue("archive");

        await component.submitMove();

        expect(component.operationError).toContain("already exists");
        expect(fileService.moveFile).not.toHaveBeenCalled();
    });

    it("moves a file and refreshes its path", async () => {
        component.menuItem = files$.value[0];
        component.operationControl.setValue("archive");

        await component.submitMove();

        expect(fileService.moveFile).toHaveBeenCalledWith(
            learningObjectId,
            "file-1",
            "archive",
        );
        expect(files$.value[0].fullPath).toBe("archive/guide.pdf");
    });

    it("keeps the dialog open and reports service failures", async () => {
        fileService.renameFile.mockReturnValue(
            throwError(new Error("service unavailable")),
        );
        component.menuItem = files$.value[0];
        component.operationControl.setValue("lesson.pdf");
        component.operation = "rename";

        await component.submitRename();

        expect(component.operation).toBe("rename");
        expect(component.operationError).toBe("service unavailable");
        expect(files$.value[0].name).toBe("guide.pdf");
    });

    it("renames a folder and refreshes descendant metadata", async () => {
        const folder = component.directoryTree.traversePath(["unit"]);
        component.menuItem = folder;
        component.operationControl.setValue("lesson");

        await component.submitRename();

        expect(fileService.renameFolder).toHaveBeenCalledWith(
            learningObjectId,
            "unit",
            "lesson",
        );
        expect(files$.value[0].fullPath).toBe("lesson/guide.pdf");
        expect(component.folderMeta$.value[0].path).toBe("lesson");
    });
});
