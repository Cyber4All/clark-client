import { environment } from '@env/environment';

export const NOTIFICATIONS_ROUTES = {
  /**
   * Request to get learning object notifications for a user
   * @param username user to get notifications for
   * @method GET
   * @auth required
   * @returns list of learning object notifications
   */
  GET_NOTIFICATIONS(username: string) {
    return `${environment.apiURL}/users/${encodeURIComponent(username)}/notifications`;
  },
  /**
   * Request to delete a learning object notification for a user
   * @param username user to delete notification for
   * @param id notification id to delete
   * @method DELETE
   * @auth required
   */
  DELETE_NOTIFICATION(username: string, id: string) {
    return `${environment.apiURL}/users/${encodeURIComponent(username)}/notifications/${encodeURIComponent(id)}`;
  },
  /**
   * Request to post a notification for a learning object
   * @param cuid learning object to post a notification for
   * @method POST
   * @auth required
   */
  POST_NOTIFICATION(cuid: string) {
    return `${environment.apiURL}/learning-objects/${encodeURIComponent(cuid)}/notifications`;
  },
};
