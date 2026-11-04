import { NgFor, NgIf } from "@angular/common";
import { HttpErrorResponse } from "@angular/common/http";
import {
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    OnInit,
    OnDestroy,
    Output,
} from "@angular/core";
import { PlaylistService } from "app/core/playlist-module/playlist.service";
import {
    CreatePlaylist,
    Playlist,
} from "app/core/playlist-module/playlist.types";
import { MatDialogModule } from "@angular/material/dialog";
import {
    createPlaylistMetadataForm,
    PlaylistMetadataFormComponent,
} from "../playlist-metadata-form/playlist-metadata-form.component";
import { ToastrOvenService } from "app/shared/modules/toaster/notification.service";
import { Observable, of, Subject } from "rxjs";
import { switchMap, tap, takeUntil } from "rxjs/operators";

@Component({
    selector: "clark-add-to-playlist-modal",
    templateUrl: "./add-to-playlist-modal.component.html",
    styleUrls: ["./add-to-playlist-modal.component.scss"],
    standalone: true,
    imports: [NgFor, NgIf, MatDialogModule, PlaylistMetadataFormComponent],
})
export class AddToPlaylistModalComponent implements OnInit, OnDestroy {
    @Input({ required: true }) learningObjectCuid!: string;
    @Input({ required: true }) userId!: string;
    @Output() added = new EventEmitter<void>();
    @Output() closed = new EventEmitter<void>();
    @Output() savingChange = new EventEmitter<boolean>();

    playlists: Playlist[] = [];
    selectedPlaylistId = "";
    loading = true;
    saving = false;
    loadFailed = false;
    creating = false;
    createError = "";
    createdPlaylist?: Playlist;

    readonly createForm = createPlaylistMetadataForm();
    private readonly destroyed$ = new Subject<void>();

    constructor(
        private readonly playlistService: PlaylistService,
        private readonly toaster: ToastrOvenService,
        private readonly changeDetectorRef: ChangeDetectorRef,
    ) {}

    ngOnInit(): void {
        this.playlistService
            .getPlaylists({ userId: this.userId })
            .pipe(takeUntil(this.destroyed$))
            .subscribe({
                next: (playlists) => {
                    this.playlists = playlists;
                    this.loading = false;
                    this.changeDetectorRef.markForCheck();
                },
                error: () => {
                    this.loading = false;
                    this.loadFailed = true;
                    this.changeDetectorRef.markForCheck();
                },
            });
    }

    togglePlaylist(playlistId: string): void {
        this.selectedPlaylistId =
            this.selectedPlaylistId === playlistId ? "" : playlistId;
    }

    showCreateForm(): void {
        if (this.saving) {
            return;
        }
        this.createdPlaylist = undefined;
        this.selectedPlaylistId = "";
        this.creating = true;
        this.createError = "";
        this.createForm.reset({ name: "", description: "" });
    }

    showPlaylistList(): void {
        if (this.saving) {
            return;
        }
        this.creating = false;
    }

    addToPlaylist(): void {
        if (!this.selectedPlaylistId || this.saving) {
            return;
        }
        const playlist = this.playlists.find(
            ({ _id }) => _id === this.selectedPlaylistId,
        );
        this.saveToPlaylist(
            this.playlistService.addLearningObject(
                this.selectedPlaylistId,
                this.learningObjectCuid,
            ),
            playlist?.name ?? "playlist",
        );
    }

    createAndAdd(): void {
        if (this.saving) {
            return;
        }
        if (this.createForm.invalid) {
            return;
        }

        const request: CreatePlaylist = {
            name: this.createForm.controls.name.value.trim(),
            description: this.createForm.controls.description.value.trim(),
            visibility: "private",
        };
        const playlist$ = this.createdPlaylist
            ? of(this.createdPlaylist)
            : this.playlistService.createPlaylist(request).pipe(
                  tap((playlist) => {
                      this.createdPlaylist = playlist;
                  }),
              );

        this.saveToPlaylist(
            playlist$.pipe(
                switchMap((playlist) =>
                    this.playlistService.addLearningObject(
                        playlist._id,
                        this.learningObjectCuid,
                    ),
                ),
            ),
            request.name,
        );
    }

    private saveToPlaylist(
        request: Observable<Playlist>,
        playlistName: string,
    ): void {
        this.saving = true;
        this.createError = "";
        this.createForm.disable();
        this.savingChange.emit(true);
        request.pipe(takeUntil(this.destroyed$)).subscribe({
            next: () => {
                this.finishSaving();
                this.toaster.success(
                    "Successfully Added!",
                    `Learning Object added to ${playlistName}`,
                );
                this.added.emit();
            },
            error: (error: HttpErrorResponse) => {
                this.finishSaving();
                if (error.status === 409) {
                    this.toaster.success(
                        "Already Added",
                        `Learning Object is already in ${playlistName}`,
                    );
                    this.added.emit();
                    return;
                }
                this.toaster.error(
                    "Unable to Add",
                    "Please try adding this Learning Object again.",
                );
                this.createError = this.createdPlaylist
                    ? "Your playlist was created, but we couldn't add this learning object. Please try again."
                    : "We couldn't create your playlist. Please try again.";
            },
        });
    }

    private finishSaving(): void {
        this.saving = false;
        this.createForm.enable();
        this.savingChange.emit(false);
        this.changeDetectorRef.markForCheck();
    }

    ngOnDestroy(): void {
        this.destroyed$.next();
        this.destroyed$.complete();
    }
}
