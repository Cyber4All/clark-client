import { environment } from '../../../../environments/environment';

export const HIERARCHY_ROUTES = {
    ADD_NEW_HIERARCHY_OBJECT() {
        return `${environment.apiURL}/hierarchy-object`;
    },
};
