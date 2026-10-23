import { NgFor, NgIf } from "@angular/common";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MatSlideToggle } from "@angular/material/slide-toggle";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { AuthService } from "app/core/auth-module/auth.service";
import { LearningObject } from "@entity";
import { LearningObjectService } from "app/core/learning-object-module/learning-object/learning-object.service";
import { SearchService } from "app/core/learning-object-module/search/search.service";
import { PlaylistService } from "app/core/playlist-module/playlist.service";
import {
    Playlist,
    PlaylistUpdate,
    PlaylistVisibility,
} from "app/core/playlist-module/playlist.types";
import { LearningObjectListingComponent } from "app/cube/shared/learning-object/learning-object.component";
import { LearningObjectCardDirective } from "app/shared/directives/learning-object-card.directive";
import { TipDirective } from "app/shared/directives/tip.directive";
import { forkJoin, Observable, of, Subject } from "rxjs";
import {
    catchError,
    debounceTime,
    distinctUntilChanged,
    map,
    switchMap,
    takeUntil,
} from "rxjs/operators";

interface PlaylistLearningObjectView {
    cuid: string;
    object: LearningObject | null;
}

@Component({
    selector: "clark-playlist-details",
    templateUrl: "./playlist-details.component.html",
    styleUrls: ["./playlist-details.component.scss"],
    standalone: true,
    imports: [
        NgFor,
        NgIf,
        FormsModule,
        MatSlideToggle,
        RouterLink,
        LearningObjectListingComponent,
        LearningObjectCardDirective,
        TipDirective,
    ],
})
export class PlaylistDetailsComponent implements OnInit, OnDestroy {
    playlist?: Playlist;
    learningObjects: PlaylistLearningObjectView[] = [];
    loading = true;
    hasError = false;
    errorMessage = "";
    editingMetadata = false;
    readonly savingFields = new Set<"name" | "description">();
    draftVisibility: PlaylistVisibility = "private";
    readonly visibilityOptions = PlaylistVisibility;
    saving = false;
    deleting = false;
    confirmDelete = false;
    searchText = "";
    searchResults: LearningObject[] = [];
    searchLoading = false;
    searchError = false;
    searchHasMore = false;
    addingCuid = "";
    private searchPage = 1;
    private readonly searchPageSize = 4;
    private readonly searchChanges = new Subject<string>();

    private readonly destroy$ = new Subject<void>();

    constructor(
        private readonly route: ActivatedRoute,
        private readonly router: Router,
        private readonly playlistService: PlaylistService,
        private readonly learningObjectService: LearningObjectService,
        private readonly searchService: SearchService,
        public readonly auth: AuthService,
    ) {}

    ngOnInit(): void {
        this.route.paramMap
            .pipe(
                takeUntil(this.destroy$),
                switchMap((params) => {
                    const playlistId = params.get("playlistId");
                    if (!playlistId) {
                        throw new Error("Playlist ID is required");
                    }
                    this.loading = true;
                    this.hasError = false;
                    return this.playlistService.getPlaylist(playlistId);
                }),
                switchMap((playlist) => {
                    this.playlist = playlist;
                    this.draftVisibility = playlist.visibility;
                    return this.loadLearningObjects(playlist);
                }),
            )
            .subscribe({
                next: (learningObjects) => {
                    this.learningObjects = learningObjects;
                    this.loading = false;
                },
                error: () => {
                    this.hasError = true;
                    this.loading = false;
                },
            });

        this.searchChanges
            .pipe(
                debounceTime(500),
                distinctUntilChanged(),
                takeUntil(this.destroy$),
            )
            .subscribe((value) => void this.search(value));
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    get isOwner(): boolean {
        return (
            !!this.playlist && this.playlist.userId === this.auth.currentUserId
        );
    }

    onSearchChange(value: string): void {
        this.searchText = value;
        this.searchError = false;
        if (value.trim().length < 3) {
            this.searchResults = [];
            this.searchHasMore = false;
            this.searchLoading = false;
        }
        this.searchChanges.next(value);
    }

    async search(value = this.searchText, append = false): Promise<void> {
        const text = value.trim();
        if (text.length < 3) {
            this.searchResults = [];
            this.searchHasMore = false;
            this.searchLoading = false;
            return;
        }

        let page = append ? this.searchPage + 1 : 1;
        if (!append) {
            this.searchResults = [];
        }
        this.searchLoading = true;
        this.searchError = false;
        const minimumLoading = new Promise<void>((resolve) =>
            setTimeout(resolve, 333),
        );
        try {
            do {
                const { learningObjects, total } =
                    await this.searchService.getLearningObjects({
                        text,
                        status: ["released"],
                        currPage: page,
                        limit: this.searchPageSize,
                        orderBy: "date",
                        sortType: -1,
                    });
                const existingCuids = new Set(
                    (this.playlist?.learningObjectCuids || []).map((cuid) =>
                        cuid.toLowerCase(),
                    ),
                );
                const candidates = learningObjects.filter(
                    (object) =>
                        object.cuid &&
                        !existingCuids.has(object.cuid.toLowerCase()),
                );
                await minimumLoading;
                this.searchResults = append
                    ? [...this.searchResults, ...candidates]
                    : candidates;
                this.searchPage = page;
                this.searchHasMore = page * this.searchPageSize < total;
                page++;
            } while (!this.searchResults.length && this.searchHasMore);
        } catch {
            this.searchError = true;
        } finally {
            await minimumLoading;
            this.searchLoading = false;
        }
    }

    savePlaylist(updates: PlaylistUpdate): void {
        if (!this.playlist || this.saving) {
            return;
        }
        this.saving = true;
        this.errorMessage = "";
        this.playlistService
            .updatePlaylist(this.playlist._id, updates)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (playlist) => {
                    this.playlist = {
                        ...this.playlist,
                        visibility: playlist.visibility,
                    };
                    this.draftVisibility = playlist.visibility;
                    this.saving = false;
                },
                error: () => {
                    this.errorMessage =
                        "We couldn't save your changes. Please try again.";
                    this.draftVisibility = this.playlist.visibility;
                    this.saving = false;
                },
            });
    }

    saveMetadataField(field: "name" | "description", event: Event): void {
        if (!this.isOwner || !this.playlist || this.savingFields.has(field)) {
            return;
        }
        const element = event.target as HTMLElement;
        const value = (element.textContent || "").trim();
        if (value === (this.playlist[field] || "").trim()) {
            return;
        }
        const maxLength = field === "name" ? 100 : 500;
        if (!value || value.length > maxLength) {
            this.errorMessage = `Playlist ${field === "name" ? "title" : "description"} must contain 1–${maxLength} characters.`;
            return;
        }
        this.errorMessage = "";
        this.savingFields.add(field);
        this.playlistService
            .updatePlaylist(this.playlist._id, { [field]: value })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (playlist) => {
                    this.playlist = {
                        ...this.playlist,
                        [field]: playlist[field],
                    };
                    this.savingFields.delete(field);
                },
                error: () => {
                    this.errorMessage =
                        "We couldn't save your changes. Edit the field and leave it to try again.";
                    this.savingFields.delete(field);
                },
            });
    }

    saveVisibility(visibility: PlaylistVisibility): void {
        if (!this.isOwner || !this.playlist || this.saving) {
            return;
        }
        this.draftVisibility = visibility;
        if (visibility !== this.playlist.visibility) {
            this.savePlaylist({ visibility });
        }
    }

    deletePlaylist(): void {
        if (!this.isOwner || !this.playlist || this.deleting) {
            return;
        }
        this.deleting = true;
        this.playlistService
            .deletePlaylist(this.playlist._id)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    void this.router.navigate(["/playlists"], {
                        queryParams: this.auth.currentUserId
                            ? { userId: this.auth.currentUserId }
                            : {},
                    });
                },
                error: () => {
                    this.errorMessage =
                        "We couldn't delete this playlist. Please try again.";
                    this.deleting = false;
                    this.confirmDelete = false;
                },
            });
    }

    addLearningObject(object: LearningObject): void {
        if (!this.isOwner || !object.cuid || this.addingCuid) {
            return;
        }
        this.addingCuid = object.cuid;
        this.errorMessage = "";
        this.playlistService
            .addLearningObject(this.playlist._id, object.cuid)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (playlist) => {
                    this.playlist = playlist;
                    this.learningObjects = [
                        ...this.learningObjects,
                        { cuid: object.cuid, object },
                    ];
                    this.searchResults = this.searchResults.filter(
                        (candidate) => candidate.cuid !== object.cuid,
                    );
                    this.addingCuid = "";
                    if (
                        !this.searchResults.length &&
                        this.searchHasMore &&
                        !this.searchLoading
                    ) {
                        void this.search(this.searchText, true);
                    }
                },
                error: () => {
                    this.errorMessage =
                        "We couldn't add this learning object. Please try again.";
                    this.addingCuid = "";
                },
            });
    }

    removeLearningObject(entry: PlaylistLearningObjectView): void {
        if (!this.isOwner || !entry.cuid) {
            return;
        }
        this.errorMessage = "";
        this.playlistService
            .removeLearningObject(this.playlist._id, entry.cuid)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (playlist) => {
                    this.playlist = playlist;
                    this.learningObjects = this.learningObjects.filter(
                        (learningObject) => learningObject.cuid !== entry.cuid,
                    );
                },
                error: () => {
                    this.errorMessage =
                        "We couldn't remove this learning object. Please try again.";
                },
            });
    }

    private loadLearningObjects(
        playlist: Playlist,
    ): Observable<PlaylistLearningObjectView[]> {
        if (!playlist.learningObjectCuids.length) {
            return of([]);
        }

        return forkJoin(
            playlist.learningObjectCuids.map((cuid) => {
                return this.learningObjectService
                    .getLearningObjectObservable({
                        cuidInfo: { cuid },
                        latestReleased: true,
                    })
                    .pipe(
                        map((object) => ({
                            cuid,
                            object:
                                object instanceof LearningObject &&
                                object.status === LearningObject.Status.RELEASED
                                    ? object
                                    : null,
                        })),
                        catchError(() => of({ cuid, object: null })),
                    );
            }),
        );
    }
}
