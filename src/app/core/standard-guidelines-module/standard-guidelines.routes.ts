import { environment } from '@env/environment';

export const STANDARD_GUIDELINES_ROUTES = {
    /**
     * Request to retrieve a framework
     * @method GET
     * @param id the id of the framework
     * @returns the framework
     */
    GET_FRAMEWORK(id: string) {
        return `${environment.apiURL}/frameworks/${id}`;
    },
    /**
     * Request to retrieve the guidelines for a framework
     * @method GET
     * @param id the id of the framework
     * @returns the guidelines for the framework
     */
    GET_FRAMEWORK_GUIDELINES(id: string) {
        return `${environment.apiURL}/frameworks/${id}/guidelines`;
    },
    /**
     * Request to retrieve a guideline
     * @method GET
     * @param id the id of the guideline
     * @returns the guideline
     */
    GET_GUIDELINE(id: string) {
        return `${environment.apiURL}/guidelines/${id}`;
    },
    /**
     * Request to retrieve a list of frameworks
     * @method GET
     * @returns list of frameworks
     */
    SEARCH_FRAMEWORKS(query: any) {
        return `${environment.apiURL}/frameworks/?${query}`;
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
