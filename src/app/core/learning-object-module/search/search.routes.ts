import { environment } from '../../../../environments/environment';

export const SEARCH_ROUTES = {
  GET_PUBLIC_LEARNING_OBJECTS: `${environment.apiURL}/learning-objects`,
  GET_PUBLIC_LEARNING_OBJECTS_WITH_FILTER(query: string) {
    return `${environment.apiURL}/learning-objects?${query}`;
  },
};
