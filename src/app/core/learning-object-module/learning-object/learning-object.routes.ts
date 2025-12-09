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
     * Path to update the children of a learning object
     * @method PATCH
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
     * Request to check if a learning object name is available
     * @method GET
     * @auth required
     * @param name - The name to check
     * @returns Promise<boolean> - true if name is available, false if duplicate exists
     */
    CHECK_NAME_AVAILABILITY(name: string) {
        return `${environment.apiURL}/learning-objects/validate-name?name=${encodeURIComponent(name)}`;
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
     * @method DELETE
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
