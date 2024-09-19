import { environment } from '@env/environment';
import * as querystring from 'querystring';

export const STANDARD_GUIDELINES_ROUTES = {
    /**
     * Request to retrieve a list of frameworks
     * @method GET
     * @returns list of frameworks
     */
    SEARCH_FRAMEWORKS(query: any) {
        return `${environment.apiURL}/frameworks/?${querystring.stringify(query)}`;
    },
    /**
     * Request to retrieve a list of guidelines
     * @method GET
     * @returns list of guidelines
     */
    SEARCH_GUIDELINES() {
        return `${environment.apiURL}/guidelines`;
    }
};
