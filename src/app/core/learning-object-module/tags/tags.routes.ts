import { environment } from '../../../../environments/environment';
import * as querystring from 'querystring';

export const TAGS_ROUTES = {
    /**
     * Request to get all topics
     * @method GET
     */
    GET_ALL_TAGS(query?: any) {
        return `${environment.apiURL}/tags?${querystring.stringify(query)}`;
    },
    /**
     * Request to update a topic for a learning object
     * @method PATCH
     * @auth required
     * @param learningObjectId - The id of the learning object
     */
    UPDATE_TAG(learningObjectCuid: string) {
        return `${environment.apiURL}/learning-objects/${encodeURIComponent(
            learningObjectCuid
        )}/tags`;
    },
};
