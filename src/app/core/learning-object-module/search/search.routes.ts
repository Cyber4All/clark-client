import { environment } from '../../../../environments/environment';
import * as querystring from 'querystring';

export const SEARCH_ROUTES = {
  GET_PUBLIC_LEARNING_OBJECTS: `${environment.apiURL}/learning-objects`,
  GET_PUBLIC_LEARNING_OBJECTS_WITH_FILTER(query: string) {
    return `${environment.apiURL}/learning-objects?${query}`;
  },

  /**
   * Request to retrieve a user's learning objects
   * @method GET
   * @param user the username or userId of the user
   * @param query the query filters to apply to the search
   * @returns the learning objects
   */
  GET_USER_LEARNING_OBJECTS(user: string, query: any) {
    return `${environment.apiURL}/users/${encodeURIComponent(user)}/learning-objects?${querystring.stringify(query)}`;
  },
};
