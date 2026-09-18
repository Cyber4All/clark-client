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

type DownloadHistoryViewItem = DownloadHistoryItem & {
    displayType: string;
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

    getDisplayName(item: DownloadHistoryItem): string {
        return item.name || "Unavailable resource";
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
            items.map(async (item) => ({
                ...item,
                displayType: await this.getDisplayType(item),
            })),
        );
    }

    private async getDisplayType(item: DownloadHistoryItem): Promise<string> {
        if (!item.available || !item.resource?.cuid) {
            return "unavailable";
        }

        try {
            const learningObject =
                await this.learningObjectService.getLearningObject(
                    item.resource.cuid,
                    item.resource.version,
                );

            return learningObject.length || item.type || "file";
        } catch {
            return item.type || "file";
        }
    }
}
