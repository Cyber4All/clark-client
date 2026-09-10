export type PlaylistVisibility = "public" | "private";

export interface Playlist {
    _id: string;
    userId: string;
    learningObjectCuids: string[];
    name: string;
    description: string;
    visibility: PlaylistVisibility;
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
    userId?: string;
}

export interface CreatePlaylistRequest {
    name: string;
    description: string;
    visibility: PlaylistVisibility;
}

export type UpdatePlaylistRequest = Partial<CreatePlaylistRequest>;
