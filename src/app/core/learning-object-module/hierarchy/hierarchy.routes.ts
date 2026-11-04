import { environment } from "../../../../environments/environment";

export const HIERARCHY_ROUTES = {
    ADD_NEW_HIERARCHY_OBJECT() {
        return `${environment.apiURL}/hierarchy-object`;
    },

    /**
     * Request to get the DIRECT children of a learning object. The gateway
     * proxies this to clark-service; it is the same resource exposed as
     * `resourceUris.children` on a learning object.
     *
     * @param learningObjectId id of the parent learning object
     */
    GET_CHILDREN(learningObjectId: string) {
        return `${environment.apiURL}/learning-objects/${encodeURIComponent(learningObjectId)}/children`;
    },
};
