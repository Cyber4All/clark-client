import { NgClass, NgFor, NgIf } from "@angular/common";
import { Component, ElementRef, ViewChild } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";

interface AiBuilderFile {
    file: File;
    iconClass: string;
}

interface MaterialItem {
    name: string;
    type: string;
    size: string;
    modified: string;
    iconClass: string;
}

@Component({
    selector: "clark-ai-object-builder",
    templateUrl: "./ai-object-builder.component.html",
    styleUrls: ["./ai-object-builder.component.scss"],
    standalone: true,
    imports: [FormsModule, NgClass, NgFor, NgIf],
})
export class AiObjectBuilderComponent {
    @ViewChild("fileInput") fileInput?: ElementRef<HTMLInputElement>;

    readonly acceptedFileTypes = ".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt";
    readonly acceptedFileTypeLabel =
        "Supports PDF, DOCX, PPTX, XLSX, TXT and more";
    readonly materialItems: MaterialItem[] = [
        {
            name: "Lectures",
            type: "Folder",
            size: "-",
            modified: "May 14, 2024",
            iconClass:
                "fa-regular fa-folder ai-object-builder__file-icon--folder",
        },
        {
            name: "Assignments",
            type: "Folder",
            size: "-",
            modified: "May 14, 2024",
            iconClass:
                "fa-regular fa-folder ai-object-builder__file-icon--folder",
        },
    ];

    files: AiBuilderFile[] = [];
    guidance = "";
    isDragActive = false;

    constructor(private router: Router) {}

    get hasFiles(): boolean {
        return this.files.length > 0;
    }

    saveAndReturn(): void {
        this.router.navigate(["/onion/dashboard"]);
    }

    openFilePicker(): void {
        this.fileInput?.nativeElement.click();
    }

    onFileInputChange(event: Event): void {
        const input = event.target as HTMLInputElement;

        this.addFiles(input.files);
        input.value = "";
    }

    onDragOver(event: DragEvent): void {
        event.preventDefault();
        this.isDragActive = true;
    }

    onDragLeave(event: DragEvent): void {
        event.preventDefault();
        this.isDragActive = false;
    }

    onDrop(event: DragEvent): void {
        event.preventDefault();
        this.isDragActive = false;
        this.addFiles(event.dataTransfer?.files);
    }

    onDropzoneKeydown(event: KeyboardEvent): void {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            this.openFilePicker();
        }
    }

    buildLearningObject(): void {
        if (!this.hasFiles) {
            return;
        }
    }

    addFiles(fileList?: FileList | File[] | null): void {
        if (!fileList?.length) {
            return;
        }

        const nextFiles = Array.from(fileList).map((file) => ({
            file,
            iconClass: this.getFileIconClass(file.name),
        }));

        this.files = [...this.files, ...nextFiles];
    }

    removeFile(fileToRemove: File): void {
        this.files = this.files.filter(({ file }) => file !== fileToRemove);
    }

    formatFileSize(file: File): string {
        if (file.size < 1024) {
            return `${file.size} B`;
        }

        const kilobytes = file.size / 1024;

        if (kilobytes < 1024) {
            return `${Math.round(kilobytes)} KB`;
        }

        return `${(kilobytes / 1024).toFixed(1)} MB`;
    }

    getFileType(fileName: string): string {
        return fileName.split(".").pop()?.toUpperCase() || "File";
    }

    private getFileIconClass(fileName: string): string {
        switch (fileName.split(".").pop()?.toLowerCase()) {
            case "pdf":
                return "fa-solid fa-file-pdf ai-object-builder__file-icon--pdf";
            case "doc":
            case "docx":
                return "fa-solid fa-file-word ai-object-builder__file-icon--word";
            case "ppt":
            case "pptx":
                return "fa-solid fa-file-powerpoint ai-object-builder__file-icon--powerpoint";
            case "txt":
                return "fa-solid fa-file-lines ai-object-builder__file-icon--text";
            case "xls":
            case "xlsx":
                return "fa-solid fa-file-excel ai-object-builder__file-icon--spreadsheet";
            default:
                return "fa-solid fa-file ai-object-builder__file-icon--default";
        }
    }
}
