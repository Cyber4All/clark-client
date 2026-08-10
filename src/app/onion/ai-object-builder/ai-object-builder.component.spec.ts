import { ComponentFixture, TestBed } from "@angular/core/testing";
import { Router } from "@angular/router";

import { AiObjectBuilderComponent } from "./ai-object-builder.component";

describe("AiObjectBuilderComponent", () => {
    let component: AiObjectBuilderComponent;
    let fixture: ComponentFixture<AiObjectBuilderComponent>;
    let router: jest.Mocked<Pick<Router, "navigate">>;

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

    it("should render the materials organizer", () => {
        expect(fixture.nativeElement.textContent).toContain(
            "CLARK AI Learning Object Builder",
        );
        expect(fixture.nativeElement.textContent).toContain("My Materials");
        expect(fixture.nativeElement.textContent).toContain("Course Materials");
        expect(fixture.nativeElement.textContent).toContain("Module 1");
        expect(fixture.nativeElement.textContent).toContain("Lectures");
        expect(fixture.nativeElement.textContent).toContain("Assignments");
        expect(fixture.nativeElement.textContent).toContain("Module 2");
        expect(fixture.nativeElement.textContent).toContain("Assessments");
        expect(fixture.nativeElement.textContent).toContain("Images");
        expect(fixture.nativeElement.textContent).not.toContain(
            "Introduction to CLARK.pdf",
        );
    });

    it("should keep module rows in a scrollable table body", () => {
        expect(
            fixture.nativeElement.querySelector(
                ".ai-object-builder__table-body",
            ),
        ).toBeTruthy();
    });

    it("should keep upload controls inside the organizer without the storage or top upload actions", () => {
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

    it("should render selected files with sizes", () => {
        component.addFiles([
            new File(["sample"], "sample.pdf", { type: "application/pdf" }),
        ]);
        fixture.detectChanges();

        expect(fixture.nativeElement.textContent).toContain("sample.pdf");
        expect(fixture.nativeElement.textContent).toContain("PDF");
        expect(fixture.nativeElement.textContent).toContain("6 B");
        expect(fixture.nativeElement.textContent).toContain("Today");
    });

    it("should navigate back to the dashboard", () => {
        component.saveAndReturn();

        expect(router.navigate).toHaveBeenCalledWith(["/onion/dashboard"]);
    });
});
