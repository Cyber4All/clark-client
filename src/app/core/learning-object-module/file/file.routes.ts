import { environment } from '../../../../environments/environment';

export type MaterialsFilter = 'released' | 'unreleased';

export const FILE_ROUTES = {
    /**
     * Request to update a file within a learning object
     * @method PATCH
     * @auth required
     * @param username - The username of the author of the learning object
     * @param learningObjectId - The id of the learning object to update
     * @param fileId - The id of the file to update
     */
    UPDATE_FILE(username: string, learningObjectId: string, fileId: string) {
        return `${environment.apiURL}/users/${encodeURIComponent(
            username
        )}/learning-objects/${encodeURIComponent(
            learningObjectId
        )}/materials/files/${encodeURIComponent(fileId)}`;
    },
    /**
     * Request to delete a file within a learning object
     * @method DELETE
     * @auth required
     * @param username - The username of the author of the learning object
     * @param learningObjectId - The id of the learning object to delete the file from
     * @param fileId - The id of the file to delete
     */
    DELETE_FILE(params: { username: string, learningObjectId: string, fileId: string }) {
        return `${environment.apiURL}/users/${encodeURIComponent(
            params.username
        )}/learning-objects/${encodeURIComponent(
            params.learningObjectId
        )}/materials/files/${encodeURIComponent(params.fileId)}`;
    },
    /**
     * Request to update the README of a learning object
     * @method PATCH
     * @auth required
     * @param id - The id of the learning object to update
     */
    UPDATE_PDF(id: string) {
        return `${environment.apiURL}/learning-objects/${encodeURIComponent(id)}/pdf`;
    },
    /**
     * Request to download a file within a learning object
     * @method GET
     * @auth required
     * @param username - The username of the author of the learning object
     * @param id - The id of the learning object to download the file from
     * @param fileId - The id of the file to download
     */
    DOWNLOAD_FILE(username: string, id: string, fileId: string) {
        return `${environment.apiURL}/users/${encodeURIComponent(
            username
        )}/learning-objects/${encodeURIComponent(
            id
        )}/files/${encodeURIComponent(fileId)}/download`;
    },
    /**
     * Request to get the materials of a learning object
     * @method GET
     * @param username - The username of the author
     * @param id - The id of the learning object to get the materials from
     */
    GET_MATERIALS(username: string, id: string, filter?: MaterialsFilter) {
        return `${environment.apiURL}/users/${encodeURIComponent(
            username
        )}/learning-objects/${encodeURIComponent(
            id
        )}/materials?status=${encodeURIComponent(filter)}`;
    },
    /**
     * Request to upload a file to a learning object
     * @method POST
     * @auth required
     * @param username - The username of the author
     * @param id - The id of the learning object to upload the file to
     */
    UPLOAD_FILE_META(username: string, id: string) {
        return `${environment.apiURL}/users/${encodeURIComponent(
            username
        )}/learning-objects/${encodeURIComponent(id)}/materials/files`;
    },
};
