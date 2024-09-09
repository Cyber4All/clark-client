import { environment } from '../../../../environments/environment';

export const LEARNING_OBJECT_ROUTES = {
    /**
     * Request to get a learning object by cuid
     * Optionally, by version
     * If version is not provided, then it returns all versions of a learning object
     * @param cuid
     * @param version
     * @returns Promise<FullLearningObject[]>
     */
    GET_LEARNING_OBJECT(cuid: string, version?: number) {
        const versionQuery = version ? `?version=${version}` : '';
        return `${environment.apiURL}/learning-objects/${encodeURIComponent(cuid)}${versionQuery}`;
    },
    /**
     * Request to get the children of a learning object
     * @param learningObjectID the id of the parent learning object
     * @returns Promise<FullLearningObject[]>
     */
    GET_LEARNING_OBJECT_CHILDREN(learningObjectID: string) {
        return `${environment.apiURL}/learning-objects/${encodeURIComponent(learningObjectID)}/children`;
    },

    /**
     *
     * @param id id of a children learning object
     * @returns Promise<FullLearningObject[]>
     */
    GET_LEARNING_OBJECT_PARENTS(learningObjectId: string) {
        return `${environment.apiURL}/learning-objects/${learningObjectId}/parents`;
    },

    GET_LEARNING_OBJECT_MATERIALS(learningObjectId: string) {
        return `${environment.apiURL}/learning-objects/${learningObjectId}/materials`;
    },

    /**
     * Path to update the status of a learning object
     * @param learningObjectId the id of the learning object
     * @returns void
     */
    UPDATE_LEARNING_OBJECT_STATUS(learningObjectId) {
        return `${environment.apiURL}/learning-objects/${encodeURIComponent(learningObjectId)}/status`;
    },

    /**
     * Path to update the children of a learning object
     * @param learningObjectId the id of the parent learning object
     * @returns void
     */
    UPDATE_LEARNING_OBJECT_CHILDREN(learningObjectId: string) {
        return `${environment.apiURL}/learning-objects/${learningObjectId}/children`;
    },

    /**
     * Path to create a new learning object
     * @returns LearningObject
     */
    CREATE_LEARNING_OBJECT() {
        return `${environment.apiURL}/learning-objects`;
    },

    /**
     * Request to update the collection of a learning object
     * @method PATCH
     * @auth required
     * @param learningObjectCuid - The cuid of the learning object to update
     */
    UPDATE_LEARNING_OBJECT_COLLECTION(learningObjectCuid: string) {
        return `${environment.apiURL}/learning-objects/${encodeURIComponent(
            learningObjectCuid
        )}/collection`;
    },

    /**
     * Path to update a learning object
     * @param learningObjectId the id of the learning object
     * @returns void
     */
    UPDATE_LEARNING_OBJECT(learningObjectId) {
        return `${environment.apiURL}/learning-objects/${encodeURIComponent(learningObjectId)}`;
    },

    /**
     * Path to remove a child of a learning object
     * @param learningObjectId the id of the parent learning object
     * @returns void
     */
    REMOVE_LEARNING_OBJECT_CHILD(learningObjectId: string) {
        return `${environment.apiURL}/learning-objects/${learningObjectId}/children`;
    },

    /**
     * Route to delete a learning object
     * @param learningObjectId id of the learning object to delete
     */
    DELETE_LEARNING_OBJECT(learningObjectId: string) {
        return `${environment.apiURL}/learning-objects/${encodeURIComponent(learningObjectId)}`;
    },
};

export const ADMIN_ROUTES = {
    ADD_HIERARCHY_OBJECT() {
        return `${environment.apiURL}/hierarchy-object`;
    },
};

export const LEGACY_COLLECTIONS_ROUTES = {
    /**
     * Request to get collection meta data
     * @method GET
     * @param name - The name of the collection
     */
    GET_COLLECTION_META(name: string) {
        return `${environment.apiURL}/collections/${encodeURIComponent(name)}/meta`;
    },
    /**
     * Request to add a learning object to a collection
     * @method PATCH
     * @auth required
     * @param learningObjectId - The id of the learning object to add to the collection
     */
    ADD_LEARNING_OBJECT_TO_COLLECTION(learningObjectId: string) {
        return `${environment.apiURL}/learning-objects/${encodeURIComponent(learningObjectId)}/collections`;
    },
    GET_COLLECTION_CURATORS(name: string) {
        return `${environment.apiURL}/users/curators/${encodeURIComponent(name)}`;
    },
};

export const LEGACY_USER_ROUTES = {
    // Route still available in gateway to LOS
    LOAD_USER_PROFILE(username: string) {
        return `${environment.apiURL}/users/${encodeURIComponent(
            username,
        )}/learning-objects/profile`;
    },
    GET_LEARNING_OBJECT_REVISION(username, learningObjectId, revisionId) {
        return `${environment.apiURL}/users/${encodeURIComponent(
            username,
        )}/learning-objects/${encodeURIComponent(
            learningObjectId,
        )}/revisions/${encodeURIComponent(revisionId)}`;
    },
    UPDATE_MY_LEARNING_OBJECT(username, learningObjectName) {
        return `${environment.apiURL}/users/${encodeURIComponent(
            username,
        )}/learning-objects/${encodeURIComponent(learningObjectName)}`;
    },
    GET_LEARNING_OBJECT(learningObjectId) {
        return `${environment.apiURL}/learning-objects/${encodeURIComponent(learningObjectId)}`;
    },
    POST_MAPPING(username: string, learningObjectId: string, outcomeId: string) {
        return `${environment.apiURL}/users/${encodeURIComponent(
            username,
        )}/learning-objects/${encodeURIComponent(
            learningObjectId,
        )}/outcomes/${encodeURIComponent(outcomeId)}/mappings`;
    },
    DELETE_MAPPING(
        username: string,
        learningObjectId: string,
        outcomeId: string,
        mappingsId: string,
    ) {
        return `${environment.apiURL}/users/${encodeURIComponent(
            username,
        )}/learning-objects/${encodeURIComponent(
            learningObjectId,
        )}/outcomes/${encodeURIComponent(outcomeId)}/mappings/${encodeURIComponent(
            mappingsId,
        )}`;
    },
    // FIXME: This route is not in the gateway
    GET_SAME_ORGANIZATION(organization) {
        return `${environment.apiURL
            }/users/search?organization=${encodeURIComponent(organization)}`;
    },
    /** ROUTE NOT IN GATEWAY */
    VALIDATE_CAPTCHA() {
        return `${environment.apiURL}/users/validate-captcha`;
    },
};
