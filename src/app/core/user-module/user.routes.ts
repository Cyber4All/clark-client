import { environment } from '@env/environment';
import { UserQuery } from 'app/interfaces/query';
import { stringify } from '../shared/stringify';

export const USER_ROUTES = {
  /**
   * Request to retrieve a list of users
   * @method GET
   * @returns list of users
   */
  GET_USERS() {
    return `${environment.apiURL}/users`;
  },
  /**
   * Request to retrieve a user
   * @method GET
   * @param query the query parameters
   */
  SEARCH_USERS(query: UserQuery = {}) {
    return `${environment.apiURL}/users?${stringify(query)}`;
  },
  /**
   * Request to retrieve a user
   * @method GET
   * @param user the username or userId of the user
   * @returns the user
   */
  GET_USER(user: string) {
    return `${environment.apiURL}/users/${encodeURIComponent(user)}`;
  },
  /**
   * Gets the user's fileAccessId also known as the Cognito Identity Id
   *
   * @param username the username of the user
   * @returns the file access id of the user (i.e Cognito Identity Id)
   */
  GET_USER_FILE_ACCESS_ID(username: string) {
    return `${environment.apiURL}/users/${encodeURIComponent(username)}/fileAccessId`;
  },
  /**
   * Request to update a user
   * @method PATCH
   * @auth required
   */
  UPDATE_USER(user: string) {
    return `${environment.apiURL}/users/${encodeURIComponent(user)}`;
  },

  VALIDATE_CAPTCHA() {
    return `${environment.apiURL}/users/validate-captcha`;
  },
};
