import { environment } from '../../../../environments/environment';

export const SEARCH_ROUTES = {
  SEARCH_LEARNING_OBJECTS(query?: string) {
    return query 
      ? `${environment.apiURL}/learning-objects?${query}` 
      : `${environment.apiURL}/learning-objects`;
  },
};
