import { ComponentFixture, TestBed } from "@angular/core/testing";
import { Router } from "@angular/router";

import { AiObjectBuilderComponent } from "./ai-object-builder.component";

describe("AiObjectBuilderComponent", () => {
    let component: AiObjectBuilderComponent;
    let fixture: ComponentFixture<AiObjectBuilderComponent>;
    let router: { navigate: jest.Mock };

    beforeEach(async () => {
        router = {
            navigate: jest.fn(),
        };

        await TestBed.configureTestingModule({
            imports: [AiObjectBuilderComponent],
            providers: [{ provide: Router, useValue: router }],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AiObjectBuilderComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("renders the empty uploaded-files state with a disabled build button", () => {
        const element: HTMLElement = fixture.nativeElement;
        const buildButton = element.querySelector(
            ".ai-object-builder__build",
        ) as HTMLButtonElement;

        expect(element.textContent).toContain("CLARK AI Object Builder");
        expect(element.textContent).toContain("No files uploaded yet");
        expect(buildButton.disabled).toBe(true);
    });

    it("adds selected files and enables the build action", () => {
        const file = new File(["content"], "overview.pdf", {
            type: "application/pdf",
        });

        component.addFiles([file] as unknown as FileList);
        fixture.detectChanges();

        const element: HTMLElement = fixture.nativeElement;
        const buildButton = element.querySelector(
            ".ai-object-builder__build",
        ) as HTMLButtonElement;

        expect(element.textContent).toContain("Uploaded files (1)");
        expect(element.textContent).toContain("overview.pdf");
        expect(buildButton.disabled).toBe(false);
    });

    it("returns to the author dashboard", () => {
        component.saveAndReturn();

        expect(router.navigate).toHaveBeenCalledWith(["/onion/dashboard"]);
    });
});
