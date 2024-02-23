import { environment } from '@env/environment';

export const USER_ROUTE = {
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
   * @param user the username of the user
   * @returns the user
   */
  GET_USER(user: string) {
    return `${environment.apiURL}/users/${encodeURIComponent(user)}`;
  },
  /**
   * Request to update a user
   * @method PATCH
   * @auth required
   */
  UPDATE_USER() {
    return `${environment.apiURL}/users`;
  },
  /**
   * Request to retrieve a user's profile
   * @method GET
   * @auth required
   * @param username the username of the user
   * @returns the user's profile
   */
  GET_USER_PROFILE(username: string) {
    return `${environment.apiURL}/users/${encodeURIComponent(username)}/profile`;
  },
};
