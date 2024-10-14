import { environment } from '@env/environment';

export const NOTIFICATIONS_ROUTES = {
  /**
   * Request to get learning object notifications for a user
   * @param username user to get notifications for
   * @param page page number of notifications to get
   * @param limit number of notifications to get per page
   * @method GET
   * @auth required
   * @returns list of learning object notifications
   */
  GET_NOTIFICATIONS(username: string, page: number, limit: number) {
    return `${environment.apiURL}/users/${encodeURIComponent(username)}/notifications?${new URLSearchParams({
      page: page.toString(),
      limit: limit.toString() })
      .toString()}`;
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
};
