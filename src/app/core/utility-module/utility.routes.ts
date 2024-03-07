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
   * Request to retrieve the list of recent blogs
   * @method GET
   * @returns list of recent blogs
   */
  GET_RECENT_BLOGS() {
    return `${environment.apiURL}/blogs?recent=true`;
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
  GET_CLIENT_VERSION(clientVersion: string) {
    return `${environment.apiURL}/clientversion&clientVersion=${encodeURIComponent(clientVersion)}`;
  },
  /**
   * Request to see if service is down or if there is a banner message
   * @method GET
   * @returns downtime information and/or banner message
   */
  GET_DOWNTIME() {
    return `${environment.apiURL}/downtime?service=clark`;
  },
  /**
   * Request to search organizations on CARD
   * @method GET
   * @returns list of organizations
   */
  SEARCH_ORGANIZATIONS(queryString: string) {
    return `${environment.cardOrganizationUrl}&text=${queryString}`;
  }
};
