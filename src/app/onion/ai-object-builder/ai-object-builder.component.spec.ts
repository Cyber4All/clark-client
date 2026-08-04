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

    it("should show an empty uploaded files state", () => {
        expect(fixture.nativeElement.textContent).toContain(
            "Uploaded files (0)",
        );
        expect(fixture.nativeElement.textContent).toContain(
            "No files uploaded yet",
        );
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

        expect(fixture.nativeElement.textContent).toContain(
            "Uploaded files (1)",
        );
        expect(fixture.nativeElement.textContent).toContain("sample.pdf");
        expect(fixture.nativeElement.textContent).toContain("6 B");
    });

    it("should navigate back to the dashboard", () => {
        component.saveAndReturn();

        expect(router.navigate).toHaveBeenCalledWith(["/onion/dashboard"]);
    });
});
