import { environment } from "@env/environment";

export const DOWNLOAD_HISTORY_ROUTE = {
    /**
     * Request to get the authenticated user's download history
     * @method GET
     * @auth required
     * @returns paged list of download history records
     */
    GET_DOWNLOAD_HISTORY(query: URLSearchParams) {
        return `${environment.apiURL}/users/download-history?${query.toString()}`;
    },
};
