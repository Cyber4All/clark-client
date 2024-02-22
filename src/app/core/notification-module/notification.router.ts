import { environment } from '@env/environment';

export const NOTIFICATIONS_ROUTES = {
  // CURRENT ROUTE DOES NOT MATCH ROUTE IN CLARK-SERVICE
  // GET, AUTH REQUIRED
  GET_NOTIFICATIONS(params: { username: string }): string {
    return `${environment.apiURL}/users/${encodeURIComponent(
      params.username
    )}/notifications`;
  },

  //DELETE, AUTH REQUIRED
  DELETE_NOTIFICATION(params: { username: string; id: string }): string {
    return `${environment.apiURL}/users/${encodeURIComponent(
      params.username
    )}/notifications/${encodeURIComponent(params.id)}`;
  },

  // POST, AUTH REQUIRED
  POST_NOTIFICATION(params: { CUID: string }): string {
    return `${environment.apiURL}/learning-objects/${encodeURIComponent(
      params.CUID
    )}/notifications`;
  },
};
