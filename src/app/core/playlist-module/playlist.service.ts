import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { forkJoin, Observable } from "rxjs";
import { map } from "rxjs/operators";
import { PLAYLIST_ROUTES } from "./playlist.routes";
import {
    CreatePlaylist,
    GetPlaylistsQuery,
    Playlist,
    PlaylistUpdate,
} from "./playlist.types";

@Injectable({ providedIn: "root" })
export class PlaylistService {
    constructor(private readonly http: HttpClient) {}

    getPlaylists(query: GetPlaylistsQuery = {}): Observable<Playlist[]> {
        return this.http.get<Playlist[]>(PLAYLIST_ROUTES.GET_PLAYLISTS(query), {
            withCredentials: true,
        });
    }

    getBrowsePlaylists(userId?: string): Observable<Playlist[]> {
        if (!userId) {
            return this.getPlaylists();
        }

        return forkJoin([
            this.getPlaylists(),
            this.getPlaylists({ userId }),
        ]).pipe(
            map(([publicPlaylists, userPlaylists]) =>
                [
                    ...new Map(
                        [...publicPlaylists, ...userPlaylists]
                            .filter(
                                (playlist) =>
                                    playlist.visibility === "public" ||
                                    playlist.userId === userId,
                            )
                            .map((playlist) => [playlist._id, playlist]),
                    ).values(),
                ].sort(
                    (a, b) =>
                        (Date.parse(b.createdAt || "") || 0) -
                        (Date.parse(a.createdAt || "") || 0),
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

    createPlaylist(input: CreatePlaylist): Observable<Playlist> {
        return this.http.post<Playlist>(
            PLAYLIST_ROUTES.CREATE_PLAYLIST(),
            input,
            {
                withCredentials: true,
            },
        );
    }

    updatePlaylist(
        playlistId: string,
        updates: PlaylistUpdate,
    ): Observable<Playlist> {
        return this.http.patch<Playlist>(
            PLAYLIST_ROUTES.UPDATE_PLAYLIST(playlistId),
            updates,
            { withCredentials: true },
        );
    }

    deletePlaylist(playlistId: string): Observable<void> {
        return this.http.delete<void>(
            PLAYLIST_ROUTES.DELETE_PLAYLIST(playlistId),
            { withCredentials: true },
        );
    }

    addLearningObject(playlistId: string, cuid: string): Observable<Playlist> {
        return this.http.put<Playlist>(
            PLAYLIST_ROUTES.ADD_LEARNING_OBJECT_TO_PLAYLIST(playlistId, cuid),
            {},
            { withCredentials: true },
        );
    }

    removeLearningObject(
        playlistId: string,
        cuid: string,
    ): Observable<Playlist> {
        return this.http.delete<Playlist>(
            PLAYLIST_ROUTES.REMOVE_LEARNING_OBJECT_FROM_PLAYLIST(
                playlistId,
                cuid,
            ),
            { withCredentials: true },
        );
    }
}
