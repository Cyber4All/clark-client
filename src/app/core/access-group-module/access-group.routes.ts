import { environment } from '@env/environment';
import * as querystring from 'querystring';

export const ACCESS_GROUP_ROUTES = {
  // GET, AUTH REQUIRED
  GET_USER_ACCESS_GROUPS(id: string) {
    return `${environment.apiURL}/access-groups/users/${encodeURIComponent(
      id
    )}`;
  },
  // POST, AUTH REQUIRED
  ADD_ACCESS_GROUP_TO_USER(username: string) {
    return `${environment.apiURL}/access-groups/users/${encodeURIComponent(
      username
    )}`;
  },
  // PATCH, AUTH REQUIRED
  REMOVE_ACCESS_GROUP_FROM_USER(username: string) {
    return `${environment.apiURL}/access-groups/users/${encodeURIComponent(
      username
    )}`;
  },
  // GET, AUTH REQUIRED
  FETCH_MEMBERS(collection: string) {
    return `${
      environment.apiURL
    }/access-groups/collections/${encodeURIComponent(collection)}/users`;
  },
};
