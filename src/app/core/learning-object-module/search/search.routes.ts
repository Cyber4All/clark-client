import { environment } from '../../../../environments/environment';

export const SEARCH_ROUTES = {
  GET_PUBLIC_LEARNING_OBJECTS: `${environment.apiURL}/learning-objects`,
  GET_PUBLIC_LEARNING_OBJECTS_WITH_FILTER(query: string) {
    return `${environment.apiURL}/learning-objects?${query}`;
  },

  /**
   * Request to retrieve a user's learning objects
   * @method GET
   * @param user the username or userId of the user
   * @returns the learning objects
   */
  GET_USER_LEARNING_OBJECTS(user: string) {
    return `${environment.apiURL}/users/${encodeURIComponent(user)}/learning-objects`;
  },
};
