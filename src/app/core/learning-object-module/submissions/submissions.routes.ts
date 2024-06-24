import { environment } from '../../../../environments/environment';

export const SUBMISSION_ROUTES = {
    /**
     * Request to get submissions for a learning object
     * @param userId - The id of the author of the learning object
     * @param learningObjectId - The id of the learning object to get submissions for
     */
    GET_SUBMISSIONS(userId: string, learningObjectId: string) {
        return `${environment.apiURL}/users/${encodeURIComponent(
            userId
        )}/learning-objects/${encodeURIComponent(learningObjectId)}/submissions`;
    },
    /**
     * Request to submit a learning object
     * @param userId - The id of the author of the learning object
     * @param learningObjectId - The id of the learning object to submit
     * @auth required
     */
    SUBMIT_LEARNING_OBJECT(params: { userId: string, learningObjectId: string }) {
        return `${environment.apiURL}/users/${encodeURIComponent(
            params.userId
        )}/learning-objects/${encodeURIComponent(params.learningObjectId)}/submissions`;
    },
    /**
     * Request to cancel a submission
     * @param learningObjectId - The id of the learning object to cancel the submission for
     * @auth required
     */
    DELETE_SUBMISSION(learningObjectId: string) {
        return `${environment.apiURL}/learning-objects/${encodeURIComponent(learningObjectId)}/submissions`;
    },
};
