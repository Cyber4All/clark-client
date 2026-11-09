import { Component, NgZone, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { FileService } from "app/core/learning-object-module/file/file.service";
import { NgIf } from "@angular/common";
import { MarkdownComponent } from "ngx-markdown";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import { environment } from "@env/environment";
import { buildNotebookPreviewUrl } from "./notebook-preview-url";

const NOTEBOOK_LOAD_TIMEOUT_MS = 15_000;
const NOTEBOOK_UNAVAILABLE_MESSAGE =
    "Notebook preview is temporarily unavailable. Download the notebook to view it locally, or try again later.";

@Component({
    selector: "clark-code-preview",
    templateUrl: "./code-preview.component.html",
    styleUrls: ["./code-preview.component.scss"],
    standalone: true,
    imports: [NgIf, MarkdownComponent],
})
export class CodePreviewComponent implements OnInit, OnDestroy {
    fileName = "";
    language = "";
    fileContent = "";
    markdownContent = "";
    isLoading = true;
    hasError = false;
    errorMessage = "";
    isNotebookPreview = false;
    notebookViewerUrl: SafeResourceUrl | null = null;
    notebookSourceUrl: string | null = null;

    private notebookLoadTimeoutId: ReturnType<typeof setTimeout> | null = null;

    constructor(
        private route: ActivatedRoute,
        private fileService: FileService,
        private sanitizer: DomSanitizer,
        private ngZone: NgZone,
    ) {}

    ngOnInit() {
        this.route.queryParams.subscribe((params) => {
            const url = params["url"];
            this.language = params["language"] || "text";
            this.fileName = params["filename"] || "Unknown File";
            this.isNotebookPreview = params["type"] === "notebook";

            if (url) {
                if (this.isNotebookPreview) {
                    this.loadNotebookPreview(url);
                } else {
                    this.loadFileContent(url);
                }
            } else {
                this.handleError("No file URL provided");
            }
        });
    }

    ngOnDestroy(): void {
        this.clearNotebookLoadTimeout();
    }

    /**
     * Loads a static notebook rendering from the configured nbviewer instance.
     */
    private loadNotebookPreview(url: string): void {
        this.clearNotebookLoadTimeout();
        this.isLoading = true;
        this.hasError = false;
        this.errorMessage = "";
        this.notebookViewerUrl = null;
        this.notebookSourceUrl = null;

        try {
            const viewerUrl = buildNotebookPreviewUrl(
                url,
                environment.notebookViewerURL,
            );
            this.notebookSourceUrl = url;
            this.notebookViewerUrl =
                this.sanitizer.bypassSecurityTrustResourceUrl(viewerUrl);
            this.startNotebookLoadTimeout();
        } catch (error) {
            this.handleError(this.formatError(error));
        }
    }

    onNotebookLoaded(): void {
        this.clearNotebookLoadTimeout();
        this.isLoading = false;
    }

    onNotebookLoadError(): void {
        this.handleError(NOTEBOOK_UNAVAILABLE_MESSAGE);
    }

    retryNotebookPreview(): void {
        if (this.notebookSourceUrl) {
            this.loadNotebookPreview(this.notebookSourceUrl);
        }
    }

    /**
     * Loads file content from the provided URL
     */
    private loadFileContent(url: string): void {
        this.clearNotebookLoadTimeout();
        this.notebookViewerUrl = null;
        this.notebookSourceUrl = null;
        this.isLoading = true;
        this.hasError = false;
        this.errorMessage = "";

        this.fileService
            .getLearningObjectFileContent(url)
            .then((content: string) => {
                this.fileContent = content;
                this.markdownContent = this.buildMarkdownContent(
                    content,
                    this.language,
                );
                this.isLoading = false;
            })
            .catch((error) => {
                this.handleError(this.formatError(error));
            });
    }

    /**
     * Builds markdown content with code block and language syntax
     */
    private buildMarkdownContent(content: string, language: string): string {
        return `\`\`\`${language}\n${content}\n\`\`\``;
    }

    /**
     * Handles general errors
     */
    private handleError(message: string): void {
        this.clearNotebookLoadTimeout();
        this.hasError = true;
        this.errorMessage = message;
        this.isLoading = false;
    }

    private startNotebookLoadTimeout(): void {
        this.ngZone.runOutsideAngular(() => {
            this.notebookLoadTimeoutId = setTimeout(() => {
                this.ngZone.run(() => {
                    this.handleError(NOTEBOOK_UNAVAILABLE_MESSAGE);
                });
            }, NOTEBOOK_LOAD_TIMEOUT_MS);
        });
    }

    private clearNotebookLoadTimeout(): void {
        if (this.notebookLoadTimeoutId !== null) {
            clearTimeout(this.notebookLoadTimeoutId);
            this.notebookLoadTimeoutId = null;
        }
    }

    private formatError(error: unknown): string {
        if (error && typeof error === "object") {
            const httpError = error as {
                status?: number;
                statusText?: string;
                message?: string;
            };
            if (typeof httpError.status === "number" && httpError.status > 0) {
                const statusText = httpError.statusText
                    ? ` ${httpError.statusText}`
                    : "";
                return `Could not load file (${httpError.status}${statusText}).`;
            }
        }

        if (typeof error === "string" && error) {
            return error;
        }

        if (error && typeof error === "object" && "message" in error) {
            const message = (error as { message?: string }).message;
            if (message) {
                return message;
            }
        }

        return "Could not load file.";
    }

    /**
     * Copies code content to clipboard
     */
    async copyToClipboard(): Promise<void> {
        try {
            await navigator.clipboard.writeText(this.fileContent);
        } catch (err) {
            console.error("Failed to copy to clipboard:", err);
        }
    }
}
