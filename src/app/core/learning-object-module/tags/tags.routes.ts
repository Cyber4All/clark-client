import { environment } from '../../../../environments/environment';
import * as querystring from 'querystring';

export const TAGS_ROUTES = {
    /**
     * Request to get all tags
     * @method GET
     * @param query the text, type, limit, and sort values
     */
    GET_ALL_TAGS(query?: any) {
        return `${environment.apiURL}/tags?${querystring.stringify(query)}`;
    },
    /**
     * Request to update tags  for a learning object
     * @method PATCH
     * @auth required
     * @param learningObjectCuid - The cuid of the learning object
     */
    UPDATE_TAG(learningObjectCuid: string) {
        return `${environment.apiURL}/learning-objects/${encodeURIComponent(
            learningObjectCuid
        )}/tags`;
    },

    /**
     * Request to get all types
     * @method GET
     */
    GET_ALL_TAG_TYPES() {
        return `${environment.apiURL}/tags/types`;
    }
};
