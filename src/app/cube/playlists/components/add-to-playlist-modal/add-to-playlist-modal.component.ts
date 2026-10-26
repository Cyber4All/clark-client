import { NgFor, NgIf } from "@angular/common";
import { HttpErrorResponse } from "@angular/common/http";
import {
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    OnInit,
    Output,
} from "@angular/core";
import {
    FormControl,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from "@angular/forms";
import { PlaylistService } from "app/core/playlist-module/playlist.service";
import {
    CreatePlaylistRequest,
    Playlist,
    PlaylistVisibility,
} from "app/core/playlist-module/playlist.types";
import { AutofocusDirective } from "app/shared/directives/autofocus.directive";
import { ToastrOvenService } from "app/shared/modules/toaster/notification.service";
import { Observable, of } from "rxjs";
import { switchMap, tap } from "rxjs/operators";

@Component({
    selector: "clark-add-to-playlist-modal",
    templateUrl: "./add-to-playlist-modal.component.html",
    styleUrls: ["./add-to-playlist-modal.component.scss"],
    standalone: true,
    imports: [NgFor, NgIf, ReactiveFormsModule, AutofocusDirective],
})
export class AddToPlaylistModalComponent implements OnInit {
    @Input({ required: true }) learningObjectCuid!: string;
    @Input({ required: true }) userId!: string;
    @Output() added = new EventEmitter<void>();
    @Output() closed = new EventEmitter<void>();

    playlists: Playlist[] = [];
    selectedPlaylistId = "";
    loading = true;
    saving = false;
    loadFailed = false;
    creating = false;
    createdPlaylist?: Playlist;

    readonly createForm = new FormGroup({
        name: new FormControl("", {
            nonNullable: true,
            validators: [Validators.required, Validators.pattern(/\S/)],
        }),
        description: new FormControl("", {
            nonNullable: true,
            validators: [Validators.required, Validators.pattern(/\S/)],
        }),
        visibility: new FormControl<PlaylistVisibility>("private", {
            nonNullable: true,
            validators: Validators.required,
        }),
    });

    constructor(
        private readonly playlistService: PlaylistService,
        private readonly toaster: ToastrOvenService,
        private readonly changeDetectorRef: ChangeDetectorRef,
    ) {}

    ngOnInit(): void {
        this.playlistService.getPlaylists(this.userId).subscribe({
            next: (playlists) => {
                this.playlists = playlists.filter(
                    ({ learningObjectCuids }) =>
                        !learningObjectCuids.includes(this.learningObjectCuid),
                );
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
        this.selectedPlaylistId = "";
        this.creating = true;
    }

    showPlaylistList(): void {
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
        if (this.createForm.invalid || this.saving) {
            this.createForm.markAllAsTouched();
            return;
        }

        const request: CreatePlaylistRequest = {
            name: this.createForm.controls.name.value.trim(),
            description: this.createForm.controls.description.value.trim(),
            visibility: this.createForm.controls.visibility.value,
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
        request.subscribe({
            next: () => {
                this.toaster.success(
                    "Successfully Added!",
                    `Learning Object added to ${playlistName}`,
                );
                this.added.emit();
            },
            error: (error: HttpErrorResponse) => {
                this.saving = false;
                this.changeDetectorRef.markForCheck();
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
            },
        });
    }
}
