import { environment } from '../../../../environments/environment';

export const BUNDLING_ROUTES = {
    /**
     * Reqest to download a bundled learning object
     * @method GET
     * @auth required
     * @param username - The username of the author of the learning object
     * @param learningObjectId - The id of the learning object to download
     */
    DOWNLOAD_BUNDLE(learningObjectId: string, username: string) {
        return `${environment.apiURL}/users/${encodeURIComponent(
            username
        )}/learning-objects/${encodeURIComponent(
            learningObjectId
        )}/bundle`;
    },
    /**
     * Request to bundle a learning object
     * @method POST
     * @auth required
     * @param learningObjectId - The id of the learning object to bundle
     */
    BUNDLE_LEARNING_OBJECT(learningObjectId: string) {
        return `${environment.apiURL}/learning-objects/${encodeURIComponent(learningObjectId)}/bundle`;
    }
};
