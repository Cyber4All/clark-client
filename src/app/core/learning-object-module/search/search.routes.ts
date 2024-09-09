import { environment } from '../../../../environments/environment';

export const SEARCH_ROUTES = {
  SEARCH_LEARNING_OBJECTS(query?: string) {
    return `${environment.apiURL}/learning-objects?${query}`;
  },

  GET_USERS_LEARNING_OBJECTS(username: string, query: string) {
    return `${environment.apiURL}/users/${username}/learning-objects?${query}`;
  }
};
