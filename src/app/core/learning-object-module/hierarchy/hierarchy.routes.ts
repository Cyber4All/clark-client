import { environment } from "../../../../environments/environment";

export const HIERARCHY_ROUTES = {
    ADD_NEW_HIERARCHY_OBJECT() {
        return `${environment.apiURL}/hierarchy-object`;
    },

    /**
     * Request to search learning objects that may become children of a parent
     * @method GET (authenticated)
     * @param learningObjectId the id of the parent learning object
     */
    GET_HIERARCHY_CANDIDATES(learningObjectId: string) {
        return `${environment.apiURL}/learning-objects/${encodeURIComponent(learningObjectId)}/hierarchy-candidates`;
    },
};
