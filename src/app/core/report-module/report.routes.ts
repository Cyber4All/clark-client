import { environment } from '@env/environment';

export const REPORT_ROUTES = {
    /**
     * Request to generate a report for a collection
     * @method POST
     * @auth required
     */
    GENERATE_REPORT() {
        return `${environment.apiURL}/reports`;
    }
};
