import { NgFor, NgIf } from "@angular/common";
import {
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    OnInit,
    Output,
} from "@angular/core";
import { PlaylistService } from "app/core/playlist-module/playlist.service";
import { Playlist } from "app/core/playlist-module/playlist.types";
import { ToastrOvenService } from "app/shared/modules/toaster/notification.service";

@Component({
    selector: "clark-add-to-playlist-modal",
    templateUrl: "./add-to-playlist-modal.component.html",
    styleUrls: ["./add-to-playlist-modal.component.scss"],
    standalone: true,
    imports: [NgFor, NgIf],
})
export class AddToPlaylistModalComponent implements OnInit {
    @Input({ required: true }) learningObjectCuid!: string;
    @Input({ required: true }) userId!: string;
    @Output() added = new EventEmitter<Playlist>();
    @Output() closed = new EventEmitter<void>();

    playlists: Playlist[] = [];
    selectedPlaylistId = "";
    loading = true;
    saving = false;
    loadFailed = false;

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

    addToPlaylist(): void {
        if (!this.selectedPlaylistId || this.saving) {
            return;
        }
        this.saving = true;
        this.playlistService
            .addLearningObject(this.selectedPlaylistId, this.learningObjectCuid)
            .subscribe({
                next: (playlist) => {
                    this.toaster.success(
                        "Successfully Added!",
                        `Learning Object added to ${playlist.name}`,
                    );
                    this.added.emit(playlist);
                },
                error: () => {
                    this.saving = false;
                    this.changeDetectorRef.markForCheck();
                    this.toaster.error(
                        "Unable to Add",
                        "Please try adding this Learning Object again.",
                    );
                },
            });
    }
}
