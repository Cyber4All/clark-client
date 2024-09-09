import * as querystring from 'querystring';
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
    GET_PUBLIC_LEARNING_OBJECT(cuid: string, version?: number) {
        const versionQuery = version ? `?version=${version}` : '';
        return `${environment.apiURL}/learning-objects/${encodeURIComponent(cuid)}${versionQuery}`;
    },
    /**
     * Request to get the children of a learning object
     * @param learningObjectID the id of the parent learning object
     * @returns Promise<FullLearningObject[]>
     */
    GET_CHILDREN(learningObjectID: string) {
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

    /**
     * Get the revision of a learning object
     * @param username
     * @param learningObjectId
     * @param revisionId
     * @returns
     */
    GET_LEARNING_OBJECT_REVISION(username, learningObjectId, revisionId) {
      return `${environment.apiURL}/users/${encodeURIComponent(
          username,
      )}/learning-objects/${encodeURIComponent(
          learningObjectId,
      )}/revisions/${encodeURIComponent(revisionId)}`;
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
     * Path to create a new learning object
     * @returns LearningObject
     */
    CREATE_LEARNING_OBJECT() {
        return `${environment.apiURL}/learning-objects`;
    },

    /**
     * Path to update the children of a learning object
     * @param learningObjectId the id of the parent learning object
     * @returns void
     */
    UPDATE_CHILDREN(learningObjectId: string) {
        return `${environment.apiURL}/learning-objects/${learningObjectId}/children`;
    },

    /**
     * Path to remove a child of a learning object
     * @param learningObjectId the id of the parent learning object
     * @returns void
     */
    REMOVE_CHILD(learningObjectId: string) {
        return `${environment.apiURL}/learning-objects/${learningObjectId}/children`;
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
     * @param filters learning object status filters
     * @param query searching by text
     * @returns LearningObjects for Author Dashboard
     */
    GET_MY_DRAFT_LEARNING_OBJECTS(username, filters, query) {
        return `${environment.apiURL}/users/${encodeURIComponent(
            username,
        )}/learning-objects?draftsOnly=true&${querystring.stringify(filters, query)}`;
    },

    /**
     * Path to get released objects of an author
     * @param username username of the author
     * @param filters filters to apply to the request
     * @returns LearningObjects for Author Dashboard
     */
    GET_MY_LEARNING_OBJECTS(
        username,
        filters: any,
    ) {
        return `${environment.apiURL}/users/${encodeURIComponent(
            username,
        )}/learning-objects?${querystring.stringify(filters)}`;
    },

    /**
     * Route to delete a learning object
     * @param learningObjectId id of the learning object to delete
     */
    DELETE_LEARNING_OBJECT(learningObjectId: string) {
        return `${environment.apiURL}/learning-objects/${encodeURIComponent(learningObjectId)}`;
    },
};

export const USER_ROUTES = {
  SET_CHILDREN(learningObjectCuid) {
    return `${environment.apiURL}/learning-objects/${encodeURIComponent(learningObjectCuid)}/children`;
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
};
