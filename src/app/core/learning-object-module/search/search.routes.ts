import { environment } from '../../../../environments/environment';
import * as querystring from 'querystring';

export const SEARCH_ROUTES = {
  SEARCH_LEARNING_OBJECTS(query?: string) {
    return query
      ? `${environment.apiURL}/learning-objects?${query}`
      : `${environment.apiURL}/learning-objects`;
  },

  /**
   * Request to retrieve a user's learning objects
   * @method GET
   * @param username the username of the user
   * @param query the query filters to apply to the search
   * @returns the learning objects
   */
  GET_USER_LEARNING_OBJECTS(username: string, query: any) {
    return `${environment.apiURL}/users/${encodeURIComponent(username)}/learning-objects?${querystring.stringify(query)}`;
  },
};
