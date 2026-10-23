export const PlaylistVisibility = {
    PUBLIC: "public",
    PRIVATE: "private",
} as const;

export type PlaylistVisibility =
    (typeof PlaylistVisibility)[keyof typeof PlaylistVisibility];

export interface PlaylistAuthor {
    _id?: string;
    userId?: string;
    username?: string;
    name?: string;
    displayName?: string;
    avatarUrl?: string;
}

export interface Playlist {
    _id: string;
    userId: string;
    learningObjectCuids: string[];
    name: string;
    description: string;
    visibility: PlaylistVisibility;
    author?: PlaylistAuthor;
    createdAt?: string;
    updatedAt?: string;
}

export interface GetPlaylistsQuery {
    playlistId?: string;
    userId?: string;
}

export type PlaylistUpdate = Partial<
    Pick<Playlist, "name" | "description" | "visibility">
>;

export type CreatePlaylist = Pick<
    Playlist,
    "name" | "description" | "visibility"
>;
