import { NgFor, NgIf } from "@angular/common";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { PlaylistService } from "app/core/playlist-module/playlist.service";
import { Playlist } from "app/core/playlist-module/playlist.types";
import { UserService } from "app/core/user-module/user.service";
import { SkipLinkComponent } from "app/shared/components/skip-link/skip-link.component";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { PlaylistCardComponent } from "./components/playlist-card/playlist-card.component";

@Component({
    selector: "clark-playlists",
    templateUrl: "./playlists.component.html",
    styleUrls: ["./playlists.component.scss"],
    standalone: true,
    imports: [NgFor, NgIf, PlaylistCardComponent, SkipLinkComponent],
})
export class PlaylistsComponent implements OnInit, OnDestroy {
    playlists: Playlist[] = [];
    authorNames: Record<string, string> = {};
    loading = true;
    hasError = false;

    private readonly destroy$ = new Subject<void>();

    constructor(
        private readonly playlistService: PlaylistService,
        private readonly userService: UserService,
    ) {}

    ngOnInit(): void {
        this.playlistService
            .getPlaylists()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (playlists) => {
                    this.playlists = playlists;
                    this.loading = false;
                    void this.loadAuthorNames(playlists);
                },
                error: () => {
                    this.hasError = true;
                    this.loading = false;
                },
            });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    trackPlaylist(_: number, playlist: Playlist): string {
        return playlist._id;
    }

    private async loadAuthorNames(playlists: Playlist[]): Promise<void> {
        const userIds = [...new Set(playlists.map(({ userId }) => userId))];
        const authors = await Promise.all(
            userIds.map(async (userId) => {
                const user = await this.userService.getUser(userId);

                return {
                    userId,
                    name: user?.name || user?.username || userId,
                };
            }),
        );

        this.authorNames = authors.reduce<Record<string, string>>(
            (names, { userId, name }) => {
                names[userId] = name;
                return names;
            },
            {},
        );
    }
}
