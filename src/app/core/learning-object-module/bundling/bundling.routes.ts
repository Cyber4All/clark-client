import { environment } from '../../../../environments/environment';

export const BUNDLING_ROUTES = {
    /**
     * Reqest to download a bundled learning object
     * @method GET
     * @auth required
     * @param username - The username of the author of the learning object
     * @param learningObjectId - The id of the learning object to download
     */
    DOWNLOAD_BUNDLE(learningObjectId: string) {
        return `${environment.apiURL}/learning-objects/${encodeURIComponent(
            learningObjectId)}/bundle`;
    },
    /**
     * Request to bundle a learning object
     * @method POST
     * @auth required
     * @param learningObjectId - The id of the learning object to bundle
     */
    BUNDLE_LEARNING_OBJECT(learningObjectId: string) {
        return `${environment.apiURL}/learning-objects/${encodeURIComponent(
            learningObjectId)}/bundle`;
    },
    /**
     * Request to toggle a file within a bundle for a learning object
     * @method PATCH
     * @auth required
     * @param username - The username of the author of the learning object
     * @param learningObjectId - The id of the learning object to toggle the bundled status
     */
    TOGGLE_BUNDLE_FILE(params: { learningObjectId: string }) {
        return `${environment.apiURL}/learning-objects/${encodeURIComponent(
            params.learningObjectId
        )}/files/bundle`;
    },
};
