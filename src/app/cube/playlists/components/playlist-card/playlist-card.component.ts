import { NgIf, NgStyle } from "@angular/common";
import { Component, Input } from "@angular/core";
import { RouterLink } from "@angular/router";
import { Playlist } from "app/core/playlist-module/playlist.types";

@Component({
    selector: "clark-playlist-card",
    templateUrl: "./playlist-card.component.html",
    styleUrls: ["./playlist-card.component.scss"],
    standalone: true,
    imports: [NgIf, NgStyle, RouterLink],
})
export class PlaylistCardComponent {
    @Input({ required: true }) playlist!: Playlist;
    @Input() showVisibility = false;
    @Input() resolvedAuthorName?: string;

    get objectCount(): number {
        return this.playlist.learningObjectCuids?.length ?? 0;
    }

    get authorName(): string {
        return (
            this.resolvedAuthorName ??
            this.playlist.author?.displayName ??
            this.playlist.author?.name ??
            this.playlist.author?.username ??
            this.playlist.author?.userId ??
            this.playlist.author?._id ??
            this.playlist.userId
        );
    }

    get authorInitial(): string {
        return this.authorName.trim().charAt(0).toUpperCase();
    }

    get authorAvatarStyle(): Record<string, string> {
        return this.playlist.author?.avatarUrl
            ? {
                  "background-image": `url(${this.playlist.author.avatarUrl})`,
              }
            : {};
    }
}
