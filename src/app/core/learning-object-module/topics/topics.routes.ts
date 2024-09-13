import { environment } from '../../../../environments/environment';

export const TOPICS_ROUTES = {
    /**
     * Request to get all topics
     * @method GET
     */
    GET_ALL_TOPICS() {
        return `${environment.apiURL}/topics`;
    },
    /**
     * Request to update a topic for a learning object
     * @method PATCH
     * @auth required
     * @param learningObjectId - The id of the learning object
     */
    UPDATE_TOPIC(learningObjectId: string) {
        return `${environment.apiURL}/learning-objects/${encodeURIComponent(
            learningObjectId
        )}/topics`;
    },
};
