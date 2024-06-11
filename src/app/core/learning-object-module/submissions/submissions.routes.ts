import { LearningObjectService } from 'app/onion/core/learning-object.service';
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
    CHECK_FIRST_SUBMISSION(params: {
        learningObjectId: string;
        query: {
            collection: string;
        };
    }) {
        const q = 'collection=' + params.query.collection;
        return `/learning-objects/${params.learningObjectId}/submissions?${q}`;
    },
    /**
     * Request to submit a learning object
     * @param userId - The id of the author of the learning object
     * @param learningObjectId - The id of the learning object to submit
     * @auth required
     */
    SUBMIT_LEARNING_OBJECT(params: { learningObjectId: string }) {
        return `${environment.apiURL}/learning-objects/${encodeURIComponent(params.learningObjectId)}/submissions`;
    },
    /**
     * Request to cancel a submission
     * @param userId - The id of the author of the learning object
     * @param learningObjectId - The id of the learning object to cancel the submission for
     * @auth required
     */
    DELETE_SUBMISSION(params: { userId: string, learningObjectId: string }) {
        return `${environment.apiURL}/users/${encodeURIComponent(
            params.userId
        )}/learning-objects/${encodeURIComponent(params.learningObjectId)}/submissions`;
    },
};
