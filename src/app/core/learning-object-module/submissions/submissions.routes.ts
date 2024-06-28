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
    /**
     * Request to check if a learning object has been submitted to a specific collection
     * @param learningObjectId - The id of the learning object to check
     * @param collection - The collection associated with the submission
     */
    CHECK_FIRST_SUBMISSION(params: {
        learningObjectId: string;
        query: {
            collection: string;
        };
    }) {
        const q = 'collection=' + params.query.collection;
        return `${environment.apiURL}/learning-objects/${encodeURIComponent(params.learningObjectId)}/submissions?${q}`;
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
     * @param learningObjectId - The id of the learning object to cancel the submission for
     * @auth required
     */
    DELETE_SUBMISSION(learningObjectId: string) {
        return `${environment.apiURL}/learning-objects/${encodeURIComponent(learningObjectId)}/submissions`;
    },
};
