import { NgFor, NgIf } from "@angular/common";
import { Component, Input } from "@angular/core";
import { Playlist } from "app/core/playlist-module/playlist.types";

@Component({
    selector: "clark-profile-playlists",
    templateUrl: "./profile-playlists.component.html",
    styleUrls: ["./profile-playlists.component.scss"],
    standalone: true,
    imports: [NgFor, NgIf],
})
export class ProfilePlaylistsComponent {
    @Input() playlists: Playlist[] = [];
    @Input() loading = false;
    @Input() hasError = false;
    @Input() isUser = false;

    trackPlaylist(_: number, playlist: Playlist): string {
        return playlist._id;
    }
}
