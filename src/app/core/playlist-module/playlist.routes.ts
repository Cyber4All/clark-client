import { environment } from "@env/environment";
import { GetPlaylistsQuery } from "./playlist.types";

const playlistsPath = `${environment.apiURL}/playlists`;

export const PLAYLIST_ROUTES = {
    GET_PLAYLISTS(query: GetPlaylistsQuery = {}): string {
        const params = new URLSearchParams();
        if (query.playlistId) {
            params.set("playlistId", query.playlistId);
        }
        if (query.userId) {
            params.set("userId", query.userId);
        }
        const queryString = params.toString();
        return queryString ? `${playlistsPath}?${queryString}` : playlistsPath;
    },

    CREATE_PLAYLIST(): string {
        return playlistsPath;
    },

    UPDATE_PLAYLIST(playlistId: string): string {
        return `${playlistsPath}/${encodeURIComponent(playlistId)}`;
    },

    DELETE_PLAYLIST(playlistId: string): string {
        return `${playlistsPath}/${encodeURIComponent(playlistId)}`;
    },

    ADD_LEARNING_OBJECT(playlistId: string, cuid: string): string {
        return `${playlistsPath}/${encodeURIComponent(playlistId)}/objects/${encodeURIComponent(cuid)}`;
    },

    REMOVE_LEARNING_OBJECT(playlistId: string, cuid: string): string {
        return `${playlistsPath}/${encodeURIComponent(playlistId)}/objects/${encodeURIComponent(cuid)}`;
    },
};
