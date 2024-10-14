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
     * @method GET
     * @returns list of collections
     */
    GET_ALL_COLLECTIONS() {
        return `${environment.apiURL}/collections`;
    },

    /**
     * Route to retrieve object meta data for a collection
     * @param abvName abbreviated name of the collection
     * @returns List of top five objects in the collection
     */
    GET_COLLECTION_METADATA(abvName: string) {
        return `${environment.apiURL}/collections/${encodeURIComponent(abvName)}`;
    }
};
