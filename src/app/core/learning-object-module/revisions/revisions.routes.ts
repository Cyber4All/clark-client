import { environment } from '../../../../environments/environment';

export const REVISION_ROUTES = {
    /**
     * Request to create a new revision of a learning object
     * @method POST
     * @auth required
     * @param cuid - The cuid of the learning object to create a new revision for
     */
    CREATE_REVISION(cuid: string) {
        return `${environment.apiURL}/learning-objects/${encodeURIComponent(cuid)}/versions`;
    },
    /**
     * Request to delete a revision of a learning object
     * @method DELETE
     * @auth required
     * @param username - The username of the author of the learning object
     * @param cuid - The cuid of the learning object to delete the revision from
     * @param version - The version of the learning object to delete
     */
    DELETE_REVISION(username: string, cuid: string, version: number) {
        return `${environment.apiURL}/users/${encodeURIComponent(
            username
        )}/learning-objects/${encodeURIComponent(cuid)}/versions/${encodeURIComponent(
            version
        )}`;
    }
};
