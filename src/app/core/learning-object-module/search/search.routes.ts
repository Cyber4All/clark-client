import { environment } from '../../../../environments/environment';
import * as queryString from 'querystring';

export const SEARCH_ROUTES = {
  SEARCH_LEARNING_OBJECTS(query?: string) {
    return `${environment.apiURL}/learning-objects?${query}`;
  },

  GET_USERS_LEARNING_OBJECTS(username: string, query: {
    draftsOnly?: boolean,
    text?: string,
    status?: string,
    limit?: number,
    page?: number,
  }) {
    return `${environment.apiURL}/users/${username}/learning-objects?${queryString.stringify(query)}`;
  }
};
