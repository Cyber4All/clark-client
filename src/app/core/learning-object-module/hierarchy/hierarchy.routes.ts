import { environment } from '../../../../environments/environment';

export const HIERARCHY_ROUTES = {
    /**
     * Request to change hierarchy status
     * @method PATCH
     * @auth required
     */
    CHANGE_HIERARCHY_STATUS(learningObjectId: string) {
        return `${environment.apiURL}/learning-objects/${encodeURIComponent(learningObjectId)}/status`;
    },
};
