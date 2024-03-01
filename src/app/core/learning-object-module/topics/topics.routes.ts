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
     * @param username - The username of the learning object author
     * @param learningObjectId - The id of the learning object
     */
    UPDATE_TOPIC(username: string, learningObjectId: string) {
        return `${environment.apiURL}/users/${encodeURIComponent(
            username
        )}/learning-objects/${encodeURIComponent(
            learningObjectId
        )}/topics`;
    },
    /**
     * Request to delete a topic from a learning object
     * @method DELETE
     * @auth required
     * @param username - The username of the learning object author
     * @param learningObjectId - The id of the learning object
     * @param topicId - The id of the topic
     */
    DELETE_TOPIC(username: string, learningObjectId: string, topicId: string) {
        return `${environment.apiURL}/users/${encodeURIComponent(
            username
        )}/learning-objects/${encodeURIComponent(
            learningObjectId
        )}/topics/${encodeURIComponent(topicId)}`;
    },
};
