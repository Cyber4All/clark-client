import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { PLAYLIST_ROUTES } from "./playlist.routes";
import { Playlist } from "./playlist.types";

@Injectable({ providedIn: "root" })
export class PlaylistService {
    constructor(private readonly http: HttpClient) {}

    getPlaylists(): Observable<Playlist[]> {
        return this.http.get<Playlist[]>(PLAYLIST_ROUTES.GET_PLAYLISTS(), {
            withCredentials: true,
        });
    }

    getPublicPlaylists(userId: string): Observable<Playlist[]> {
        return this.http
            .get<Playlist[]>(PLAYLIST_ROUTES.GET_PLAYLISTS({ userId }), {
                withCredentials: true,
            })
            .pipe(
                map((playlists) =>
                    playlists.filter(
                        (playlist) =>
                            playlist.userId === userId &&
                            playlist.visibility === "public",
                    ),
                ),
            );
    }

    getPlaylist(playlistId: string): Observable<Playlist> {
        return this.http.get<Playlist>(
            PLAYLIST_ROUTES.GET_PLAYLISTS({ playlistId }),
            { withCredentials: true },
        );
    }
}
