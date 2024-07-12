import { environment } from '../../../../environments/environment';
import * as querystring from 'querystring';

export const LEARNING_OBJECT_ROUTES = {
    /**
     * Request to get the children of a learning object
     * @param learningObjectID the id of the parent learning object
     * @returns Promise<FullLearningObject[]>
     */
    GET_CHILDREN(learningObjectID: string) {
        return `${environment.apiURL}/learning-objects/${encodeURIComponent(learningObjectID)}/children`;
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
     * Path to create a new learning object
     * @returns LearningObject
     */
    CREATE_LEARNING_OBJECT() {
        return `${environment.apiURL}/learning-objects`;
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
     * Path to get an author's learning objects
     * @param username username of the author
     * @returns LearningObjects for Author Dashboard
     */
    GET_MY_DRAFT_LEARNING_OBJECTS(username) {
        // Onion Dashboard
        return `${environment.apiURL}/users/${encodeURIComponent(
            username,
        )}/learning-objects?draftsOnly=true`;
    },
};

export const USER_ROUTES = {
    GET_MY_LEARNING_OBJECTS(
      username,
      filters: any,
    ) {
        // Onion
        return `${environment.apiURL}/users/${encodeURIComponent(
            username,
        )}/learning-objects?${querystring.stringify(filters)}`;
    }
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
    /**
     * Request to update the collection of a learning object
     * @method PATCH
     * @auth required
     * @param username - The username of the author of the learning object
     * @param learningObjectCuid - The cuid of the learning object to update
     */
    UPDATE_LEARNING_OBJECT_COLLECTION(username: string, learningObjectCuid: string) {
        return `${environment.apiURL}/users/${encodeURIComponent(
            username
        )}/learning-objects/${encodeURIComponent(
            learningObjectCuid
        )}/collection`;
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
    GET_LEARNING_OBJECT(id) {
        return `${environment.apiURL}/learning-objects/${encodeURIComponent(id)}`;
    },
    DELETE_LEARNING_OBJECT(id: string) {
        return `${environment.apiURL}/learning-objects/${encodeURIComponent(id)}`;
    },
    DELETE_MULTIPLE_LEARNING_OBJECTS(username, learningObjectNames) {
        return `${environment.apiURL}/users/${encodeURIComponent(
            username,
        )}/learning-objects/multiple/${encodeURIComponent(learningObjectNames)}`;
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
    SET_CHILDREN(username, learningObjectName) {
        return `${environment.apiURL}/learning-objects/${encodeURIComponent(
            username,
        )}/${encodeURIComponent(learningObjectName)}/children`;
    },
    GET_CHILDREN(username: string, learningObjectID: string) {
        return `${environment.apiURL}/users/${encodeURIComponent(
            username,
        )}/learning-objects/${encodeURIComponent(learningObjectID)}/children`;
    }
};

export const LEGACY_PUBLIC_LEARNING_OBJECT_ROUTES = {
    /**
     * Request to get all learning object stats
     * @method GET
     */
    GET_LEARNING_OBJECT_STATS() {
        return `${environment.apiURL}/learning-objects/stats`;
    },
    GET_PUBLIC_LEARNING_OBJECTS: `${environment.apiURL}/learning-objects`,
    GET_PUBLIC_LEARNING_OBJECTS_WITH_FILTER(query) {
        return `${environment.apiURL}/learning-objects?${query}`;
    },
    GET_PUBLIC_LEARNING_OBJECT(cuid: string, version?: number) {
        let uri = `${environment.apiURL}/learning-objects/${encodeURIComponent(cuid)}`;

        if (version !== undefined) {
            uri += '?version=' + version.toString();
        }

        return uri;
    },
    GET_LEARNING_OBJECT_PARENTS(username: string, id: string) {
        return `${environment.apiURL}/users/${username}/learning-objects/${id}/parents`;
    },
    DOWNLOAD_FILE(params: {
        username: string;
        loId: string;
        fileId: string;
        open?: boolean;
    }) {
        return `${environment.apiURL}/users/${encodeURIComponent(
            params.username,
        )}/learning-objects/${params.loId}/files/${params.fileId}/download${params.open ? '?open=true' : ''
            }`;
    },
};
