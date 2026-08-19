import { readFileSync } from "fs";
import { join } from "path";

import { ComponentFixture, TestBed } from "@angular/core/testing";
import { Router } from "@angular/router";

import { AiObjectBuilderComponent } from "./ai-object-builder.component";

describe("AiObjectBuilderComponent", () => {
    let component: AiObjectBuilderComponent;
    let fixture: ComponentFixture<AiObjectBuilderComponent>;
    let router: jest.Mocked<Pick<Router, "navigate">>;

    const file = (name: string, body = "sample", type = "application/pdf") =>
        new File([body], name, { type });

    const selectedRows = () =>
        Array.from(
            fixture.nativeElement.querySelectorAll(
                ".ai-object-builder__selected-row",
            ),
        ) as HTMLElement[];

    const selectedList = () =>
        fixture.nativeElement.querySelector(
            ".ai-object-builder__selected-list",
        ) as HTMLElement;

    const scss = () =>
        readFileSync(
            join(__dirname, "ai-object-builder.component.scss"),
            "utf8",
        );

    beforeEach(async () => {
        router = {
            navigate: jest.fn(),
        };

        await TestBed.configureTestingModule({
            imports: [AiObjectBuilderComponent],
            providers: [{ provide: Router, useValue: router }],
            teardown: { destroyAfterEach: false },
        }).compileComponents();

        fixture = TestBed.createComponent(AiObjectBuilderComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should render the target builder shell without the old breadcrumb table or action menus", () => {
        expect(fixture.nativeElement.textContent).toContain(
            "CLARK AI Learning Object Builder",
        );
        expect(fixture.nativeElement.textContent).toContain("Select All");
        expect(fixture.nativeElement.textContent).toContain(
            "Files selected as context for CLARK AI to read",
        );
        expect(fixture.nativeElement.textContent).toContain(
            "These files will be used by CLARK AI to understand your content and draft your learning object.",
        );
        expect(
            fixture.nativeElement.querySelector(".ai-object-builder__table"),
        ).toBeNull();
        expect(
            fixture.nativeElement.querySelector(
                ".ai-object-builder__breadcrumbs",
            ),
        ).toBeNull();
        expect(
            fixture.nativeElement.querySelector(
                ".ai-object-builder__action-menu",
            ),
        ).toBeNull();
    });

    it("should select and deselect an individual file by stable file id", () => {
        component.selectFolder("module-1");
        component.addFiles([file("sample.pdf")]);
        const uploadedId = component.uploadedFiles[0].id;

        component.toggleNodeSelection(component.allFileNodes[0], false);

        expect(component.selectedFileIds.has(uploadedId)).toBe(false);
        expect(component.selectedFileCount).toBe(0);

        component.toggleNodeSelection(component.allFileNodes[0], true);

        expect(component.selectedFileIds.has(uploadedId)).toBe(true);
        expect(component.selectedFileCount).toBe(1);
    });

    it("should select and deselect every descendant file for a folder", () => {
        component.selectFolder("module-1");
        component.addFiles([file("one.pdf")]);
        component.selectFolder("module-2");
        component.addFiles([file("two.pdf")]);
        component.clearSelection();

        component.toggleNodeSelection(component.tree[0], true);

        expect(component.selectedFileCount).toBe(2);
        expect(component.isNodeChecked(component.tree[0])).toBe(true);

        component.toggleNodeSelection(component.tree[0], false);

        expect(component.selectedFileCount).toBe(0);
        expect(component.isNodeChecked(component.tree[0])).toBe(false);
    });

    it("should support nested-folder selection", () => {
        component.selectFolder("module-1");
        component.addFiles([file("nested.pdf")]);
        component.clearSelection();

        const moduleOne = component.tree[0].children![0];
        component.toggleNodeSelection(moduleOne, true);

        expect(component.selectedFiles.map(({ name }) => name)).toEqual([
            "nested.pdf",
        ]);
        expect(component.isNodeChecked(moduleOne)).toBe(true);
        expect(component.isNodeIndeterminate(component.tree[0])).toBe(false);
    });

    it("should derive indeterminate folder states from selected descendants", () => {
        component.selectFolder("module-1");
        component.addFiles([file("one.pdf")]);
        component.selectFolder("module-2");
        component.addFiles([file("two.pdf")]);

        component.toggleNodeSelection(component.allFileNodes[1], false);

        expect(component.isNodeIndeterminate(component.tree[0])).toBe(true);
        expect(component.isNodeChecked(component.tree[0])).toBe(false);
    });

    it("should derive Select All checked and indeterminate states", () => {
        component.selectFolder("module-1");
        component.addFiles([file("one.pdf")]);
        component.selectFolder("module-2");
        component.addFiles([file("two.pdf")]);

        expect(component.isSelectAllChecked).toBe(true);
        expect(component.isSelectAllIndeterminate).toBe(false);

        component.toggleNodeSelection(component.allFileNodes[0], false);

        expect(component.isSelectAllChecked).toBe(false);
        expect(component.isSelectAllIndeterminate).toBe(true);

        component.toggleSelectAll(false);

        expect(component.selectedFileCount).toBe(0);
        expect(component.isSelectAllIndeterminate).toBe(false);

        component.toggleSelectAll(true);

        expect(component.selectedFileCount).toBe(2);
        expect(component.isSelectAllChecked).toBe(true);
    });

    it("should clear all selected files without removing uploaded files", () => {
        component.addFiles([file("sample.pdf")]);

        component.clearSelection();

        expect(component.uploadedFiles.length).toBe(1);
        expect(component.selectedFileCount).toBe(0);
        fixture.detectChanges();
        expect(fixture.nativeElement.textContent).toContain(
            "No files selected yet.",
        );
    });

    it("should remove a selected file from the selected-files list and tree selection", () => {
        component.addFiles([file("sample.pdf")]);
        fixture.detectChanges();

        (
            fixture.nativeElement.querySelector(
                ".ai-object-builder__remove",
            ) as HTMLButtonElement
        ).click();
        fixture.detectChanges();

        expect(component.selectedFileCount).toBe(0);
        expect(selectedRows()).toHaveLength(0);
        expect(component.isNodeChecked(component.allFileNodes[0])).toBe(false);
    });

    it("should distinguish duplicate filenames by unique ids and parent paths", () => {
        component.selectFolder("module-1");
        component.addFiles([file("sample.pdf")]);
        component.selectFolder("assessments");
        component.addFiles([file("sample.pdf")]);
        fixture.detectChanges();

        expect(component.uploadedFiles[0].id).not.toBe(
            component.uploadedFiles[1].id,
        );
        expect(selectedRows()).toHaveLength(2);
        expect(selectedRows()[0].textContent).toContain(
            "Course Materials/Module 1/",
        );
        expect(selectedRows()[1].textContent).toContain("Assessments/");
    });

    it("should preserve selection after expanding and collapsing folders", () => {
        component.selectFolder("module-1");
        component.addFiles([file("sample.pdf")]);
        const fileId = component.uploadedFiles[0].id;
        const moduleOne = component.tree[0].children![0];

        component.onChevronClick(moduleOne, new Event("click"));
        component.onChevronClick(moduleOne, new Event("click"));

        expect(component.selectedFileIds.has(fileId)).toBe(true);
        expect(component.selectedFileCount).toBe(1);
    });

    it("should update selected-file count after file, folder, clear, and remove actions", () => {
        component.addFiles([file("one.pdf"), file("two.pdf")]);
        fixture.detectChanges();

        expect(fixture.nativeElement.textContent).toContain("2 files");

        component.toggleNodeSelection(component.allFileNodes[0], false);
        fixture.detectChanges();

        expect(fixture.nativeElement.textContent).toContain("1 file");

        component.clearSelection();
        fixture.detectChanges();

        expect(fixture.nativeElement.textContent).toContain("0 files");
    });

    it("should select newly uploaded files automatically", () => {
        component.addFiles([file("new.pdf")]);

        expect(component.selectedFiles.map(({ name }) => name)).toEqual([
            "new.pdf",
        ]);
    });

    it("should keep selected-files scrolling internal after more than six rows", () => {
        component.addFiles(
            Array.from({ length: 7 }, (_value, index) =>
                file(`file-${index}.pdf`),
            ),
        );
        fixture.detectChanges();

        expect(selectedRows()).toHaveLength(7);
        expect(selectedList().getAttribute("tabindex")).toBe("0");
        expect(scss()).toContain("max-height: 294px");
        expect(scss()).toContain("overflow-y: auto");
        expect(scss()).toContain("overflow-x: hidden");
    });

    it("should truncate long filenames without horizontal scrolling", () => {
        const longName =
            "very-long-curriculum-material-filename-that-should-truncate.pdf";
        component.addFiles([file(longName)]);
        fixture.detectChanges();

        const filename = fixture.nativeElement.querySelector(
            ".ai-object-builder__selected-name label",
        ) as HTMLLabelElement;

        expect(filename.title).toBe(longName);
        expect(scss()).toContain("text-overflow: ellipsis");
        expect(scss()).toContain("white-space: nowrap");
    });

    it("should keep upload and selected list keyboard accessible", () => {
        const dropzone = fixture.nativeElement.querySelector(
            ".ai-object-builder__dropzone",
        ) as HTMLElement;
        const list = selectedList();

        expect(dropzone.getAttribute("role")).toBe("button");
        expect(dropzone.getAttribute("tabindex")).toBe("0");
        expect(list.getAttribute("role")).toBe("region");
        expect(list.getAttribute("tabindex")).toBe("0");

        const openSpy = jest.spyOn(component, "openFilePicker");
        component.onDropzoneKeydown(
            new KeyboardEvent("keydown", { key: "Enter" }),
        );

        expect(openSpy).toHaveBeenCalled();
    });

    it("should disable building until at least one valid file is selected", () => {
        const buildButton = () =>
            fixture.nativeElement.querySelector(
                'button[type="submit"]',
            ) as HTMLButtonElement;

        expect(buildButton().disabled).toBe(true);

        component.addFiles([file("sample.pdf")]);
        fixture.detectChanges();

        expect(buildButton().disabled).toBe(false);

        component.clearSelection();
        fixture.detectChanges();

        expect(buildButton().disabled).toBe(true);
    });

    it("should include the responsive stacked layout rule", () => {
        expect(scss()).toContain("@media (max-width: 980px)");
        expect(scss()).toContain("grid-template-columns: 1fr");
    });

    it("should navigate back to the dashboard", () => {
        component.saveAndReturn();

        expect(router.navigate).toHaveBeenCalledWith(["/onion/dashboard"]);
    });
});
