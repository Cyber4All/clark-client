import { Component, OnInit } from "@angular/core";
import {
    DownloadHistoryItem,
    LibraryService,
} from "app/core/library-module/library.service";
import { ToastrOvenService } from "app/shared/modules/toaster/notification.service";
import { NavbarService } from "app/core/client-module/navbar.service";
import { DatePipe, NgFor, NgIf, TitleCasePipe } from "@angular/common";
import { ActivateDirective } from "../../shared/directives/activate.directive";
import { LearningObjectService } from "app/core/learning-object-module/learning-object/learning-object.service";
import { Router } from "@angular/router";
import { FileService } from "app/core/learning-object-module/file/file.service";
import { LearningObject } from "@entity";

type DownloadHistoryViewItem = DownloadHistoryItem & {
    displayType: string;
    displayTitle: string;
    learningObject?: LearningObject;
    downloadFile?: LearningObject.Material.File;
};

@Component({
    selector: "clark-library",
    templateUrl: "./library.component.html",
    styleUrls: ["./library.component.scss"],
    standalone: true,
    imports: [NgIf, NgFor, DatePipe, TitleCasePipe, ActivateDirective],
})
export class LibraryComponent implements OnInit {
    downloadHistoryItems: DownloadHistoryViewItem[] = [];
    loading = false;
    loadingMore = false;
    serviceError = false;
    nextCursor?: string;
    readonly pageSize = 20;

    constructor(
        public libraryService: LibraryService,
        private toaster: ToastrOvenService,
        private navbarService: NavbarService,
        private learningObjectService: LearningObjectService,
        private fileService: FileService,
        private router: Router,
    ) {}

    async ngOnInit() {
        this.navbarService.show();
        await this.loadDownloadHistory();
    }

    async loadDownloadHistory(cursor?: string) {
        const isLoadingMore = Boolean(cursor);

        try {
            this.serviceError = false;
            this.loading = !isLoadingMore;
            this.loadingMore = isLoadingMore;

            const response = await this.libraryService.getDownloadHistory({
                limit: this.pageSize,
                cursor,
            });

            // Download history is retained by the API even after a resource has
            // been removed or the viewer loses access. Those records cannot be
            // opened, so exclude them rather than displaying an unavailable row.
            const items = await this.withDisplayTypes(
                response.items.filter((item) => item.available),
            );

            this.downloadHistoryItems = isLoadingMore
                ? [...this.downloadHistoryItems, ...items]
                : items;
            this.nextCursor = response.nextCursor;
        } catch (e) {
            console.log(e);
            this.toaster.error(
                "Error!",
                "Unable to load your download history. Please try again later.",
            );
            this.serviceError = true;
        } finally {
            this.loading = false;
            this.loadingMore = false;
        }
    }

    retry() {
        this.loadDownloadHistory();
    }

    loadMore() {
        if (this.nextCursor && !this.loadingMore) {
            this.loadDownloadHistory(this.nextCursor);
        }
    }

    async goToItem(event: Event, item: DownloadHistoryItem) {
        event.stopPropagation();

        if (!this.canNavigate(item)) {
            return;
        }

        try {
            const learningObject =
                await this.learningObjectService.getLearningObject(
                    item.resource!.cuid,
                    item.resource!.version,
                );

            await this.router.navigate([
                "/details",
                learningObject.author.username,
                learningObject.cuid,
                learningObject.version,
            ]);
        } catch (e) {
            console.log(e);
            this.toaster.error(
                "Error!",
                "Unable to open this learning object. Please try again later.",
            );
        }
    }

    canNavigate(item: DownloadHistoryItem): boolean {
        return Boolean(item.available && item.resource?.cuid);
    }

    getDisplayTitle(item: DownloadHistoryViewItem): string {
        return (
            item.displayTitle ||
            item.title ||
            item.name ||
            "Unavailable resource"
        );
    }

    isBundle(item: DownloadHistoryItem): boolean {
        return this.getNormalizedDownloadType(item) === "bundle";
    }

    isFile(item: DownloadHistoryItem): boolean {
        return this.getNormalizedDownloadType(item) === "file";
    }

    getDownloadType(item: DownloadHistoryItem): "Bundle" | "File" {
        return this.isBundle(item) ? "Bundle" : "File";
    }

    getFilePath(item: DownloadHistoryItem): string {
        return this.isFile(item) ? item.filePath || "" : "";
    }

    getFileName(item: DownloadHistoryItem): string {
        return this.isFile(item) && item.fileName
            ? this.getPathBaseName(item.fileName)
            : "";
    }

    canDownloadFile(item: DownloadHistoryViewItem): boolean {
        return Boolean(
            this.isFile(item) &&
            item.available &&
            item.resource &&
            item.fileName &&
            item.learningObject &&
            item.downloadFile,
        );
    }

    async downloadFile(event: Event, item: DownloadHistoryViewItem) {
        event.preventDefault();
        event.stopPropagation();

        if (!this.canDownloadFile(item)) {
            return;
        }

        try {
            await this.fileService.handleFileDownload(
                item.downloadFile!,
                item.learningObject!,
            );
        } catch (e) {
            console.log(e);
            this.toaster.error(
                "Error!",
                "Unable to download this file. Please try again later.",
            );
        }
    }

    trackDownloadHistoryItem(
        index: number,
        item: DownloadHistoryViewItem,
    ): string {
        return `${item.downloadedAt}-${item.name || index}`;
    }

    private async withDisplayTypes(
        items: DownloadHistoryItem[],
    ): Promise<DownloadHistoryViewItem[]> {
        return Promise.all(
            items.map(async (item) => {
                const display = await this.getDisplayDetails(item);
                return { ...item, ...display };
            }),
        );
    }

    private async getDisplayDetails(
        item: DownloadHistoryItem,
    ): Promise<
        Pick<
            DownloadHistoryViewItem,
            "displayType" | "displayTitle" | "learningObject" | "downloadFile"
        >
    > {
        if (!item.available || !item.resource?.cuid) {
            return {
                displayType: "unavailable",
                displayTitle: item.title || item.name,
            };
        }

        try {
            const learningObject =
                await this.learningObjectService.getLearningObject(
                    item.resource.cuid,
                    item.resource.version,
                );
            if (
                this.isFile(item) &&
                item.fileName &&
                learningObject.resourceUris?.materials
            ) {
                // Basic learning-object responses expose materials as a separate
                // resource. Load it before looking for the downloaded file.
                await new Promise<void>((resolve, reject) => {
                    this.learningObjectService
                        .fetchLearningObjectResources(learningObject, [
                            "materials",
                        ])
                        .subscribe({
                            next: (resource) => {
                                if (Array.isArray(resource.data?.files)) {
                                    learningObject.materials = resource.data;
                                } else {
                                    reject(
                                        new Error(
                                            "Unable to load file materials",
                                        ),
                                    );
                                }
                            },
                            error: reject,
                            complete: resolve,
                        });
                });
            }
            return {
                displayType: learningObject.length || item.type || "file",
                displayTitle: item.title || learningObject.name || item.name,
                learningObject,
                downloadFile:
                    this.isFile(item) && item.fileName
                        ? learningObject.materials?.files?.find(
                              (file) => file.name === item.fileName,
                          )
                        : undefined,
            };
        } catch {
            return {
                displayType: item.type,
                displayTitle: item.title || item.name,
            };
        }
    }

    private getPathBaseName(filePath: string): string {
        return filePath.split(/[\\/]/).filter(Boolean).pop() || filePath;
    }

    private getNormalizedDownloadType(item: DownloadHistoryItem): string {
        return item.type?.toLowerCase() || "";
    }
}
