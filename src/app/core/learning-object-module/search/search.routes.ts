import { environment } from '../../../../environments/environment';

export const SEARCH_ROUTES = {
  SEARCH_LEARNING_OBJECTS: `${environment.apiURL}/learning-objects`,
  SEARCH_LEARNING_OBJECTS_WITH_FILTER(query: string) {
    return `${environment.apiURL}/learning-objects?${query}`;
  },
};
