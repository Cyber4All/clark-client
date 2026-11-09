import { TestBed } from "@angular/core/testing";
import { ActivatedRoute } from "@angular/router";
import { MarkdownModule } from "ngx-markdown";
import { of } from "rxjs";
import { FileService } from "app/core/learning-object-module/file/file.service";
import { CodePreviewComponent } from "./code-preview.component";

describe("CodePreviewComponent", () => {
    const fileService = {
        getLearningObjectFileContent: jest.fn(),
    };

    async function createComponent(queryParams: Record<string, string>) {
        await TestBed.configureTestingModule({
            imports: [MarkdownModule.forRoot(), CodePreviewComponent],
            providers: [
                { provide: FileService, useValue: fileService },
                {
                    provide: ActivatedRoute,
                    useValue: { queryParams: of(queryParams) },
                },
            ],
        }).compileComponents();

        const fixture = TestBed.createComponent(CodePreviewComponent);
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        return {
            fixture,
            component: fixture.componentInstance,
        };
    }

    beforeEach(() => {
        fileService.getLearningObjectFileContent.mockReset();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it("loads and renders source code as before", async () => {
        fileService.getLearningObjectFileContent.mockResolvedValue(
            "const answer = 42;",
        );

        const { component, fixture } = await createComponent({
            url: "https://files.example.com/example.ts",
            language: "typescript",
            filename: "example.ts",
        });

        expect(fileService.getLearningObjectFileContent).toHaveBeenCalledWith(
            "https://files.example.com/example.ts",
        );
        expect(component.markdownContent).toBe(
            "```typescript\nconst answer = 42;\n```",
        );
        expect(fixture.nativeElement.querySelector("markdown")).toBeTruthy();
        expect(
            fixture.nativeElement.querySelector(".copy-button"),
        ).toBeTruthy();
    });

    it("embeds notebooks with nbviewer instead of loading them as text", async () => {
        const { component, fixture } = await createComponent({
            url: "https://files.example.com/example.ipynb?token=a%2Fb",
            type: "notebook",
            filename: "example.ipynb",
        });

        const iframe = fixture.nativeElement.querySelector(
            ".notebook-content iframe",
        ) as HTMLIFrameElement;

        expect(component.isNotebookPreview).toBe(true);
        expect(fileService.getLearningObjectFileContent).not.toHaveBeenCalled();
        expect(iframe).toBeTruthy();
        expect(iframe.src).toBe(
            "https://nbviewer.org/urls/files.example.com/example.ipynb/%3Ftoken%3Da%252Fb",
        );
        expect(iframe.title).toBe("Notebook preview for example.ipynb");
        expect(fixture.nativeElement.querySelector(".copy-button")).toBeFalsy();
        expect(
            fixture.nativeElement.querySelector(".download-button"),
        ).toBeTruthy();

        iframe.dispatchEvent(new Event("load"));
        fixture.detectChanges();
        expect(component.isLoading).toBe(false);
    });

    it("shows a graceful fallback when a notebook preview times out", async () => {
        jest.useFakeTimers();

        const { component, fixture } = await createComponent({
            url: "https://files.example.com/example.ipynb",
            type: "notebook",
            filename: "example.ipynb",
        });

        jest.advanceTimersByTime(15_000);
        fixture.detectChanges();

        expect(component.hasError).toBe(true);
        expect(component.errorMessage).toBe(
            "Notebook preview is temporarily unavailable. Download the notebook to view it locally, or try again later.",
        );
        expect(
            fixture.nativeElement.querySelector(".notebook-content iframe"),
        ).toBeFalsy();
        expect(
            fixture.nativeElement.querySelector(".retry-button"),
        ).toBeTruthy();
        expect(
            fixture.nativeElement.querySelector(
                ".error-state .download-button",
            ),
        ).toBeTruthy();
    });

    it("shows the same fallback when the notebook iframe reports an error", async () => {
        const { component, fixture } = await createComponent({
            url: "https://files.example.com/example.ipynb",
            type: "notebook",
            filename: "example.ipynb",
        });
        const iframe = fixture.nativeElement.querySelector(
            ".notebook-content iframe",
        ) as HTMLIFrameElement;

        iframe.dispatchEvent(new Event("error"));
        fixture.detectChanges();

        expect(component.hasError).toBe(true);
        expect(
            fixture.nativeElement.querySelector(".retry-button"),
        ).toBeTruthy();
    });

    it("retries a failed notebook preview", async () => {
        jest.useFakeTimers();

        const { component, fixture } = await createComponent({
            url: "https://files.example.com/example.ipynb",
            type: "notebook",
            filename: "example.ipynb",
        });

        jest.advanceTimersByTime(15_000);
        fixture.detectChanges();
        component.retryNotebookPreview();
        fixture.detectChanges();

        expect(component.hasError).toBe(false);
        expect(component.isLoading).toBe(true);
        expect(
            fixture.nativeElement.querySelector(".notebook-content iframe"),
        ).toBeTruthy();
    });

    it("shows an error for a notebook with an unsupported source URL", async () => {
        const { component, fixture } = await createComponent({
            url: "javascript:alert(1)",
            type: "notebook",
            filename: "example.ipynb",
        });

        expect(component.hasError).toBe(true);
        expect(component.errorMessage).toBe("Invalid notebook source URL.");
        expect(
            fixture.nativeElement.querySelector(".notebook-content iframe"),
        ).toBeFalsy();
    });

    it("shows an error when no file URL is provided", async () => {
        const { component } = await createComponent({
            type: "notebook",
            filename: "example.ipynb",
        });

        expect(component.hasError).toBe(true);
        expect(component.errorMessage).toBe("No file URL provided");
    });
});
