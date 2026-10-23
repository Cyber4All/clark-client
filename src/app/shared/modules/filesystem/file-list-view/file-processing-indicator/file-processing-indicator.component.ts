import {
    AsyncPipe,
    NgIf,
    NgSwitch,
    NgSwitchCase,
    NgSwitchDefault,
} from "@angular/common";
import { Component, Input } from "@angular/core";
import { LearningObject } from "@entity";
import { FileService } from "app/core/learning-object-module/file/file.service";
import { isParseableFile } from "app/core/learning-object-module/file/file-processing";
import { DirectoryNode } from "../../DirectoryNode";

interface ParsingSummary {
    label: string;
    icon: string;
    parsing: boolean;
    parsed: boolean;
    failed: boolean;
    timedOut: boolean;
}

interface ParsingState {
    hasFiles: boolean;
    hasSupportedFiles: boolean;
    parsed: boolean;
    parsing: boolean;
    failed: boolean;
    unavailable: boolean;
    timedOut: boolean;
    queued: boolean;
}

@Component({
    selector: "clark-file-processing-indicator",
    standalone: true,
    imports: [AsyncPipe, NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault],
    templateUrl: "./file-processing-indicator.component.html",
    styleUrls: ["./file-processing-indicator.component.scss"],
})
export class FileProcessingIndicatorComponent {
    @Input() item: LearningObject.Material.File | DirectoryNode;

    constructor(public fileService: FileService) {}

    getSummary(statuses: ReadonlyMap<string, string>): ParsingSummary {
        const folder = this.item instanceof DirectoryNode;
        const allFiles = this.getItemFiles();
        const files = allFiles.filter(isParseableFile);
        const parsedCount = files.filter(
            (file) => statuses.get(file._id) === "success",
        ).length;
        const parsed = files.length > 0 && parsedCount === files.length;
        const failed = files.some(
            (file) => statuses.get(file._id) === "failure",
        );
        const parsing = files.some(
            (file) => statuses.get(file._id) === "processing",
        );
        const queued = files.some(
            (file) => statuses.get(file._id) === "queued",
        );
        const unavailable = files.some(
            (file) =>
                ![
                    "success",
                    "processing",
                    "queued",
                    "not_started",
                    "failure",
                    "cancelled",
                    "partial_success",
                ].includes(statuses.get(file._id)),
        );
        const timedOut = files.some(
            (file) => statuses.get(file._id) === "partial_success",
        );
        const display = this.getStatusDisplay({
            hasFiles: allFiles.length > 0,
            hasSupportedFiles: files.length > 0,
            parsed,
            parsing,
            failed,
            unavailable,
            timedOut,
            queued,
        });
        if (folder && files.length) {
            display.label += ` (${parsedCount}/${files.length})`;
        }

        return {
            ...display,
            parsing,
            parsed,
            failed: failed || unavailable,
            timedOut,
        };
    }

    private getStatusDisplay(
        state: ParsingState,
    ): Pick<ParsingSummary, "label" | "icon"> {
        if (!state.hasFiles) return { label: "No files", icon: "fa-minus" };
        if (!state.hasSupportedFiles)
            return { label: "Not parseable", icon: "fa-minus" };
        if (state.parsed) return { label: "Ready", icon: "fa-check-circle" };
        if (state.parsing)
            return { label: "Parsing…", icon: "fa-spinner-third" };
        if (state.failed)
            return { label: "Failed", icon: "fa-exclamation-circle" };
        if (state.unavailable)
            return {
                label: "Status unavailable",
                icon: "fa-exclamation-circle",
            };
        if (state.timedOut)
            return { label: "Partial success", icon: "fa-exclamation-circle" };
        if (state.queued) return { label: "Queued", icon: "fa-clock" };
        return { label: "Not started", icon: "fa-minus" };
    }

    private getItemFiles(): LearningObject.Material.File[] {
        if (this.item instanceof DirectoryNode)
            return this.getFolderFiles(this.item);
        if (this.item) return [this.item];
        return [];
    }

    private getFolderFiles(
        folder: DirectoryNode,
    ): LearningObject.Material.File[] {
        return [
            ...folder.getFiles(),
            ...folder
                .getFolders()
                .reduce<
                    LearningObject.Material.File[]
                >((files, child) => files.concat(this.getFolderFiles(child)), []),
        ];
    }
}
