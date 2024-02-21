import { environment } from '@env/environment';

export const AUTH_ROUTES = {
  // Encryption Routes
  // GET
  GET_KEY_PAIR(): string {
    return `${environment.apiURL}/keys`;
  },

  // Token Routes
  // GET, AUTH REQUIRED
  DECODE_TOKEN: `${environment.apiURL}/users/tokens`,
  // GET, AUTH REQUIRED
  REFRESH_TOKEN: `${environment.apiURL}/users/tokens/refresh`,

  // Registration/Login Routes
  // POST
  LOGIN: `${environment.apiURL}/users/login`,
  // POST
  REGISTER: `${environment.apiURL}/users`,

  //Missing few routes, coming back later to this module
};
