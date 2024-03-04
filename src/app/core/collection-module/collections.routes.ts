import { environment } from '@env/environment';

export const COLLECTION_ROUTES = {
    /**
     * Request to retrieve a list of collections that a user has submitted to
     * @param username the username of the user
     * @method GET
     * @auth required
     * @returns list of collections
     */
    GET_USER_SUBMITTED_COLLECTIONS(username: string) {
        return `${environment.apiURL}/users/${encodeURIComponent(username)}/collections`;
    },
    /**
     * Request to retrieve all collections
     */
    GET_ALL_COLLECTIONS() {
        return `${environment.apiURL}/collections`;
    },
    /**
     * Request to retrieve a collection by its abbreviated name
     * @param abvName the abbreviated name of the collection
     * @method GET
     * @returns the collection information
     */
    GET_COLLECTION(abvName: string) {
        return `${environment.apiURL}/collections/${encodeURIComponent(abvName)}`;
    },
    /**
     * Request to retrieve the metrics of a collection
     * @param abvName the abbreviated name of the collection
     * @method GET
     * @returns the metrics of the collection
     */
    GET_COLLECTION_METRICS(abvName: string) {
        return `${environment.apiURL}/collections/${encodeURIComponent(abvName)}/metrics`;
    },
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
};
