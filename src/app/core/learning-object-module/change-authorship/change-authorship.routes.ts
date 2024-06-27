import { environment } from '../../../../environments/environment';

export const CHANGE_AUTHORSHIP_ROUTES = {
    /**
     * Request to change the author of a learning object
     * @method POST
     * @auth required
     * @param userId - The id of the current author of the learning object
     * @param learningObjectId - The id of the learning object to change authorship
     */
    CHANGE_AUTHORSHIP(userId: string, learningObjectId: string) {
        return `${environment.apiURL}/users/${encodeURIComponent(
            userId
        )}/learning-objects/${encodeURIComponent(
            learningObjectId
        )}/change-author`;
    }
};
