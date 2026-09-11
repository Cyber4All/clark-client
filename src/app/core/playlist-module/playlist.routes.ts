import { environment } from "@env/environment";
import { GetPlaylistsQuery } from "./playlist.types";

const playlistsPath = `${environment.apiURL}/playlists`;

export const PLAYLIST_ROUTES = {
    GET_PLAYLISTS(query: GetPlaylistsQuery = {}): string {
        const params = new URLSearchParams();
        if (query.playlistId) {
            params.set("playlistId", query.playlistId);
        }
        const queryString = params.toString();
        return queryString ? `${playlistsPath}?${queryString}` : playlistsPath;
    },
};
