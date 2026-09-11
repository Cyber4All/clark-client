import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { PLAYLIST_ROUTES } from "./playlist.routes";
import { Playlist, PlaylistDetails } from "./playlist.types";

@Injectable({ providedIn: "root" })
export class PlaylistService {
    constructor(private readonly http: HttpClient) {}

    getPlaylists(): Observable<Playlist[]> {
        return this.http.get<Playlist[]>(PLAYLIST_ROUTES.GET_PLAYLISTS(), {
            withCredentials: true,
        });
    }

    getPlaylist(playlistId: string): Observable<PlaylistDetails> {
        return this.http.get<PlaylistDetails>(
            PLAYLIST_ROUTES.GET_PLAYLISTS({ playlistId }),
            { withCredentials: true },
        );
    }
}
