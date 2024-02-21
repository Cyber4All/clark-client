import { environment } from '@env/environment';

export const LIBRARY_ROUTES = {
  // GET, AUTH REQUIRED
  GET_CART(username) {
    return `${environment.apiURL}/users/${encodeURIComponent(
      username
    )}/library`;
  },
  // DELETE, AUTH REQUIRED
  CLEAR_LEARNING_OBJECT_FROM_CART(username, cuid) {
    return `${environment.apiURL}/users/${encodeURIComponent(
      username
    )}/library/${encodeURIComponent(cuid)}`;
  },
  // PATCH, AUTH REQUIRED
  ADD_LEARNING_OBJECT_TO_CART(username) {
    return `${environment.apiURL}/users/${encodeURIComponent(
      username
    )}/library`;
  },
};
