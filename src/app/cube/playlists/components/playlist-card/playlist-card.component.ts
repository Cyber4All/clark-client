import { NgIf } from "@angular/common";
import { Component, Input } from "@angular/core";
import { RouterLink } from "@angular/router";
import { Playlist } from "app/core/playlist-module/playlist.types";

@Component({
    selector: "clark-playlist-card",
    templateUrl: "./playlist-card.component.html",
    styleUrls: ["./playlist-card.component.scss"],
    standalone: true,
    imports: [NgIf, RouterLink],
})
export class PlaylistCardComponent {
    @Input({ required: true }) playlist!: Playlist;
    @Input() showVisibility = false;

    get objectCount(): number {
        return this.playlist.learningObjectCuids?.length ?? 0;
    }
}
