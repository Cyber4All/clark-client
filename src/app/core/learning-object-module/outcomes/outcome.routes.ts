import { environment } from '../../../../environments/environment';

export const OUTCOME_ROUTES = {
    /**
     * Request to create a learning outcome
     * @method POST
     * @auth required
     * @param learningObjectId - The id of the learning object to create the outcome for
     */
    CREATE_OUTCOME(learningObjectId: string) {
        return `${environment.apiURL}/learning-objects/${encodeURIComponent(
            learningObjectId
        )}/learning-outcomes`;
    },
    /**
     * Request to update a learning outcome
     * @method PATCH
     * @auth required
     * @param learningObjectId - The id of the learning object to update the outcome for
     * @param outcomeId - The id of the outcome to update
     */
    UPDATE_OUTCOME(learningObjectId: string, outcomeId: string) {
        return `${environment.apiURL}/learning-objects/${encodeURIComponent(
            learningObjectId
        )}/learning-outcomes/${encodeURIComponent(outcomeId)}`;
    },
    /**
     * Request to delete a learning outcome
     * @method DELETE
     * @auth required
     * @param learningObjectId - The id of the learning object to delete the outcome from
     * @param outcomeId - The id of the outcome to delete
     */
    DELETE_OUTCOME(learningObjectId: string, outcomeId: string) {
        return `${environment.apiURL}/learning-objects/${encodeURIComponent(
            learningObjectId
        )}/learning-outcomes/${encodeURIComponent(outcomeId)}`;
    },
    /**
     * Request to get the learning outcomes of a learning object
     * @method GET
     * @param username - The username of the author of the learning object
     * @param learningObjectId - The id of the learning object to get the outcomes from
     */
    GET_OUTCOMES(username: string, learningObjectId: string) {
        return `${environment.apiURL}/users/${encodeURIComponent(
            username
        )}/learning-objects/${encodeURIComponent(
            learningObjectId
        )}/outcomes`;
    },
};
