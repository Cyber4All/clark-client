import { environment } from '@env/environment';

export const USER_ROUTE = {
  // GET
  FETCH_USERS: `${environment.apiURL}/users`,

  // GET
  FETCH_USER(user: string) {
    return `${environment.apiURL}/users/${encodeURIComponent(user)}`;
  },

  // PATCH, AUTH REQUIRED
  EDIT_USER_INFO: `${environment.apiURL}/users`,

  // GET, AUTH REQUIRED
  FETCH_USER_PROFILE(username) {
    return `${environment.apiURL}/users/${encodeURIComponent(
      username
    )}/profile`;
  },
};
