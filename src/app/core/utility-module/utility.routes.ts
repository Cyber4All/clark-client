import { environment } from '@env/environment';

export const UTILITY_ROUTES = {
  /**
   * Request to retrieve the list of blogs
   * @method GET
   * @returns list of blogs
   */
  GET_BLOGS() {
    return `${environment.apiURL}/blogs`;
  },
  /**
   * Request to post a blog
   * @method POST
   * @auth required
   * @returns the blog that was posted
   */
  POST_BLOGS() {
    return `${environment.apiURL}/blogs`;
  },
  /**
   * Request to retrieve the client version
   * @method GET
   * @returns the client version
   */
  GET_CLIENT_VERSION() {
    return `${environment.apiURL}/clientversion`;
  },
  /**
   * Request to see if service is down or if there is a banner message
   * @method GET
   * @returns downtime information and/or banner message
   */
  GET_DOWNTIME() {
    return `${environment.apiURL}/downtime`;
  },
};
