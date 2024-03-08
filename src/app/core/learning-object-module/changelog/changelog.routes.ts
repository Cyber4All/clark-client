import { environment } from '../../../../environments/environment';

export const CHANGELOG_ROUTES = {
    /**
     * Request to create a new changelog for a learning object
     * @method POST
     * @auth required
     * @param userId - The id of the learning object author
     * @param learningObjectCuid - The cuid of the learning object
     */
    CREATE_CHANGELOG(userId: string, learningObjectCuid: string) {
        return `${environment.apiURL}/users/${encodeURIComponent(
            userId
        )}/learning-objects/${encodeURIComponent(
            learningObjectCuid
        )}/changelog`;
    },
    /**
     * Request to get changelogs for a given Learning Object
     * @method GET
     * @auth required
     * @param userId - The id of the Learning Object author
     * @param learningObjectId - The id of the Learning Object
     */
    FETCH_CHANGELOGS(params: { userId: string, learningObjectCuid: string, minusRevision?: boolean }) {
        return `${environment.apiURL}/users/${encodeURIComponent(
            params.userId
        )}/learning-objects/${encodeURIComponent(
            params.learningObjectCuid
        )}/changelogs?minusRevision=${encodeURIComponent(
            params.minusRevision
        )}`;
    }
};
