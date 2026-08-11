import { ComponentFixture, TestBed } from "@angular/core/testing";
import { Router } from "@angular/router";

import { AiObjectBuilderComponent } from "./ai-object-builder.component";

describe("AiObjectBuilderComponent", () => {
    let component: AiObjectBuilderComponent;
    let fixture: ComponentFixture<AiObjectBuilderComponent>;
    let router: jest.Mocked<Pick<Router, "navigate">>;

    const getTreeText = () =>
        (
            fixture.nativeElement.querySelector(
                ".ai-object-builder__folder-tree",
            ) as HTMLElement
        ).textContent || "";

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

    it("should render course materials collapsed on first load", () => {
        expect(fixture.nativeElement.textContent).toContain(
            "CLARK AI Learning Object Builder",
        );
        expect(getTreeText()).toContain("Course Materials");
        expect(getTreeText()).toContain("Assessments");
        expect(getTreeText()).toContain("Images");
        expect(getTreeText()).not.toContain("Module 1");
        expect(getTreeText()).not.toContain("Module 2");
    });

    it("should show only direct children when course materials is expanded", () => {
        component.onTreeNodeClick(component.tree[0]);
        fixture.detectChanges();

        expect(getTreeText()).toContain("Course Materials");
        expect(getTreeText()).toContain("Module 1");
        expect(getTreeText()).toContain("Module 2");
        expect(getTreeText()).not.toContain("Lectures");
        expect(getTreeText()).not.toContain("Assignments");
    });

    it("should preserve independent expanded folder state", () => {
        component.onTreeNodeClick(component.tree[0]);
        component.selectFolder("module-1");
        component.addFiles([
            new File(["sample"], "sample.pdf", { type: "application/pdf" }),
        ]);
        component.onTreeNodeClick(component.tree[0].children![0]);
        fixture.detectChanges();

        expect(getTreeText()).toContain("sample.pdf");

        component.selectFolder("module-2");
        component.addFiles([
            new File(["sample"], "module-2.pdf", { type: "application/pdf" }),
        ]);
        fixture.detectChanges();

        expect(getTreeText()).toContain("sample.pdf");
        expect(getTreeText()).not.toContain("module-2.pdf");
    });

    it("should collapse course materials and hide all descendants", () => {
        component.onTreeNodeClick(component.tree[0]);
        component.onTreeNodeClick(component.tree[0].children![0]);
        fixture.detectChanges();

        expect(getTreeText()).toContain("Module 1");

        component.onTreeNodeClick(component.tree[0]);
        fixture.detectChanges();

        expect(getTreeText()).not.toContain("Module 1");
        expect(getTreeText()).not.toContain("Module 2");
    });

    it("should keep empty modules visible without rendering placeholder children", () => {
        component.onTreeNodeClick(component.tree[0]);
        component.selectFolder("module-1");
        fixture.detectChanges();

        expect(getTreeText()).toContain("Module 1");
        expect(component.currentRows).toEqual([]);
        expect(fixture.nativeElement.textContent).not.toContain("Lectures");
        expect(fixture.nativeElement.textContent).not.toContain("Assignments");
        expect(fixture.nativeElement.textContent).not.toContain(
            "Introduction to CLARK.pdf",
        );
    });

    it("should synchronize selection, breadcrumb, and direct table contents", () => {
        component.selectFolder("course-materials");
        fixture.detectChanges();

        expect(component.breadcrumbNodes.map(({ name }) => name)).toEqual([
            "Course Materials",
        ]);
        expect(component.currentRows.map(({ name }) => name)).toEqual([
            "Module 1",
            "Module 2",
        ]);

        component.selectFolder("module-1");
        fixture.detectChanges();

        expect(component.breadcrumbNodes.map(({ name }) => name)).toEqual([
            "Course Materials",
            "Module 1",
        ]);
        expect(component.currentRows).toEqual([]);
    });

    it("should add uploaded files to the selected folder and render them in the tree and table", () => {
        component.selectFolder("module-1");
        component.addFiles([
            new File(["sample"], "sample.pdf", { type: "application/pdf" }),
        ]);
        fixture.detectChanges();

        expect(component.currentRows.map(({ name }) => name)).toEqual([
            "sample.pdf",
        ]);
        expect(fixture.nativeElement.textContent).toContain("sample.pdf");
        expect(fixture.nativeElement.textContent).toContain("PDF");
        expect(fixture.nativeElement.textContent).toContain("6 B");
        expect(fixture.nativeElement.textContent).toContain("Today");

        component.selectFolder("module-2");
        fixture.detectChanges();

        expect(component.currentRows).toEqual([]);
    });

    it("should not show a chevron for folders with no children", () => {
        component.onTreeNodeClick(component.tree[0]);
        fixture.detectChanges();

        const moduleButton = Array.from(
            fixture.nativeElement.querySelectorAll(
                ".ai-object-builder__folder",
            ),
        ).find((button) => button.textContent?.includes("Module 1")) as
            | HTMLElement
            | undefined;

        expect(moduleButton).toBeTruthy();
        expect(moduleButton?.querySelector(".fa-chevron-right")).toBeNull();
        expect(moduleButton?.querySelector(".fa-chevron-down")).toBeNull();
    });

    it("should show chevrons only for folders with children", () => {
        expect(
            fixture.nativeElement.querySelector(
                ".ai-object-builder__folder .fa-chevron-right",
            ),
        ).toBeTruthy();

        component.onTreeNodeClick(component.tree[0]);
        fixture.detectChanges();

        expect(
            fixture.nativeElement.querySelector(
                ".ai-object-builder__folder .fa-chevron-down",
            ),
        ).toBeTruthy();

        component.selectFolder("module-1");
        component.addFiles([
            new File(["sample"], "sample.pdf", { type: "application/pdf" }),
        ]);
        fixture.detectChanges();

        const fileButton = Array.from(
            fixture.nativeElement.querySelectorAll(
                ".ai-object-builder__folder",
            ),
        ).find((button) => button.textContent?.includes("sample.pdf")) as
            | HTMLElement
            | undefined;

        expect(fileButton?.querySelector(".fa-chevron-right")).toBeNull();
        expect(fileButton?.querySelector(".fa-chevron-down")).toBeNull();
    });

    it("should show row action menu options", () => {
        component.addFiles([
            new File(["sample"], "sample.pdf", { type: "application/pdf" }),
        ]);
        fixture.detectChanges();

        const row = component.currentRows.find(({ type }) => type === "file");

        expect(row).toBeTruthy();

        component.toggleActionMenu(row!, new MouseEvent("click"));

        expect(component.activeActionNode?.name).toBe("sample.pdf");
        expect(
            component.getActionMenuOptions(component.activeActionNode),
        ).toEqual(["Preview", "Rename", "Move to...", "Remove"]);
    });

    it("should keep upload controls inside the organizer without storage or top upload actions", () => {
        expect(fixture.nativeElement.textContent).toContain(
            "Drop files here or browse",
        );
        expect(fixture.nativeElement.textContent).toContain(
            "Supports PDF, DOCX, PPTX, XLSX, TXT and more",
        );
        expect(fixture.nativeElement.textContent).not.toContain("GB used");
        expect(
            fixture.nativeElement.querySelector('button[aria-label="Upload"]'),
        ).toBeNull();
    });

    it("should disable building until a file is selected", () => {
        const button = fixture.nativeElement.querySelector(
            'button[type="submit"]',
        ) as HTMLButtonElement;

        expect(button.disabled).toBe(true);
    });

    it("should navigate back to the dashboard", () => {
        component.saveAndReturn();

        expect(router.navigate).toHaveBeenCalledWith(["/onion/dashboard"]);
    });
});
