import { environment } from '@env/environment';

export const REPORT_ROUTES = {
    /**
     * Request to generate a report for a collection
     * @method POST
     * @auth required
     */
    GENERATE_REPORT(
        collections: string[],
        date?: { start: string; end: string },
    ) {
        let route = `${environment.apiURL}/reports?output=csv&collection=${collections.join(',')}`;

        if (date) {
            route += `&start=${date.start}&end=${date.end}`;
        }

        return route;
    }
};
