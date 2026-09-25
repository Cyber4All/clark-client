export type PlaylistVisibility = "public" | "private";

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

export interface PlaylistLearningObjectCard {
    cuid: string;
    name: string;
    description: string;
    objectCollection: string;
    length: string;
    levels: string[];
    version: number;
    status: string;
}

export interface PlaylistLearningObject {
    cuid: string;
    object: PlaylistLearningObjectCard | null;
}

export interface PlaylistDetails extends Playlist {
    learningObjects: PlaylistLearningObject[];
}

export interface GetPlaylistsQuery {
    playlistId?: string;
}
