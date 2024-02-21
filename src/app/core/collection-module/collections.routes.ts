import { environment } from '@env/environment';

export const COLLECTION_ROUTES = {

    //GET, AUTH REQUIRED
    GET_USER_SUBMITTED_COLLECTIONS(username: string) {
        return `${environment.apiURL}/users/${encodeURIComponent(username)}/collections`;
    },
};
