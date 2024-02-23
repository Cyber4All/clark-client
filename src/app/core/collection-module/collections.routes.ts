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
    }
};
