import { environment } from '../../../../environments/environment';

export const RELEVANCY_ROUTES = {
    /**
     * Request to update the next-check-date of a learning object
     * @param id - The id of the learning object to update
     * @auth required
     * @method PATCH
     */
    UPDATE_RELEVANCY_CHECK_DATE(id: string) {
        return `${environment.apiURL}/learning-objects/${encodeURIComponent(id)}/relevancy-check`;
    },
    /**
     * Request to update the curricular guidelines of a learning object
     * @param id - The id of the learning object to update
     * @param outcomeId - The id of the learning outcome to update
     * @auth required
     * @method PATCH
     */
    UPDATE_MAPPING(id: string, outcomeId: string) {
        return `${environment.apiURL}/learning-objects/${encodeURIComponent(id)}/learning-outcomes/${encodeURIComponent(
            outcomeId
        )}/guidelines`;
    },
    /**
     * Request to add an evaluator to a learning object
     * @auth required
     * @method POST
     */
    ADD_EVALUATOR() {
        return `${environment.apiURL}/learning-objects/evaluators`;
    },
    /**
     * Request to add date of when a learning object was last evaluated
     * @param username - The username of the author of the learning object
     * @param cuid - The cuid of the learning object to update
     * @auth required
     * @method PATCH
     */
    ADD_EVALUATION_DATE(username: string, cuid: string) {
        return `${environment.apiURL}/users/${encodeURIComponent(
            username
        )}/learning-objects/${encodeURIComponent(cuid)}/evaluation`;
    },
    /**
     * Request to update evaluators of a learning object
     * @auth required
     * @method PATCH
     */
    UPDATE_EVALUATORS() {
        return `${environment.apiURL}/learning-objects/evaluators`;
    },
    /**
     * Request to get evaluations for a user
     * @param username - The username of the evaluator
     * @method GET
     */
    GET_EVALUATIONS(username: string) {
        return `${environment.apiURL}/users/${encodeURIComponent(
            username
        )}/evaluations`;
    },
};
