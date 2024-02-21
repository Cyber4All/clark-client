import { environment } from '@env/environment';

export const UTILITY_ROUTES = {
  //Blog routes
  // GET, AUTH REQUIRED
  GET_BLOGS: `${environment.apiURL}/blogs`,

  // POST, AUTH REQUIRED
  POST_BLOG: `${environment.apiURL}/blogs`,

  // Client Version routes
  // GET
  CLIENT_VERSION: `${environment.apiURL}/clientversion`,
};
