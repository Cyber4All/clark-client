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
     * Request to update evaluators of a learning object
     * @auth required
     * @method PATCH
     */
    UPDATE_EVALUATORS() {
        return `${environment.apiURL}/learning-objects/evaluators`;
    },
};
