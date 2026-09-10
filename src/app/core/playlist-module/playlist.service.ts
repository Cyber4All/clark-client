import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { PLAYLIST_ROUTES } from "./playlist.routes";
import {
    CreatePlaylistRequest,
    Playlist,
    PlaylistDetails,
    UpdatePlaylistRequest,
} from "./playlist.types";

@Injectable({ providedIn: "root" })
export class PlaylistService {
    constructor(private readonly http: HttpClient) {}

    getPlaylists(userId?: string): Observable<Playlist[]> {
        return this.http.get<Playlist[]>(
            PLAYLIST_ROUTES.GET_PLAYLISTS({ userId }),
            { withCredentials: true },
        );
    }

    getPlaylist(playlistId: string): Observable<PlaylistDetails> {
        return this.http.get<PlaylistDetails>(
            PLAYLIST_ROUTES.GET_PLAYLISTS({ playlistId }),
            { withCredentials: true },
        );
    }

    createPlaylist(request: CreatePlaylistRequest): Observable<Playlist> {
        return this.http.post<Playlist>(
            PLAYLIST_ROUTES.CREATE_PLAYLIST(),
            request,
            { withCredentials: true },
        );
    }

    updatePlaylist(
        playlistId: string,
        request: UpdatePlaylistRequest,
    ): Observable<Playlist> {
        return this.http.patch<Playlist>(
            PLAYLIST_ROUTES.UPDATE_PLAYLIST(playlistId),
            request,
            { withCredentials: true },
        );
    }

    deletePlaylist(playlistId: string): Observable<void> {
        return this.http
            .delete(PLAYLIST_ROUTES.DELETE_PLAYLIST(playlistId), {
                observe: "response",
                withCredentials: true,
            })
            .pipe(map(() => undefined));
    }

    addLearningObject(playlistId: string, cuid: string): Observable<Playlist> {
        return this.http.put<Playlist>(
            PLAYLIST_ROUTES.ADD_LEARNING_OBJECT(playlistId, cuid),
            {},
            { withCredentials: true },
        );
    }

    removeLearningObject(
        playlistId: string,
        cuid: string,
    ): Observable<Playlist> {
        return this.http.delete<Playlist>(
            PLAYLIST_ROUTES.REMOVE_LEARNING_OBJECT(playlistId, cuid),
            { withCredentials: true },
        );
    }
}
