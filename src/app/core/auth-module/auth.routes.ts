import { environment } from '@env/environment';

export const AUTH_ROUTES = {
  /**
   * Request to create a new RSA key pair and stores it in the database
   * @method GET
   * @returns The public key of the newly created key pair
   */
  GET_KEY_PAIR() {
    return `${environment.apiURL}/keys`;
  },
  /**
   * Request to decode a user token
   * @method GET
   * @auth required
   * @returns the decoded user token
   */
  DECODE_TOKEN() {
    return `${environment.apiURL}/users/tokens`;
  },
  /**
   * Request to refresh the user's access token using a valid Jwt
   * @method GET
   * @auth required
   * @returns The user's information and tokens
   */
  REFRESH_TOKEN() {
    return `${environment.apiURL}/users/tokens/refresh`;
  },
  /**
   * Request to login a user
   * @method POST
   * @returns The user's information and tokens
   */
  LOGIN() {
    return `${environment.apiURL}/users/login`;
  },
  /**
   * Registers a new user and logs them in
   * @method POST
   * @returns The user's information and token
   */
  REGISTER() {
    return `${environment.apiURL}/users`;
  },
  /**
   * Checks if a username or email is taken
   * @method GET
   * @returns True if the username or email is taken, false otherwise
   */
  VALIDATE_IDENTIFIER() {
    return `${environment.apiURL}/users/validate`;
  },
  /**
   * Request to verify a user's email
   * @method GET
   */
  OTA_VERIFY_EMAIL() {
    return `${environment.apiURL}/users/ota-code`;
  },
  /**
   * Request to send ota code to a user's email
   * @method POST
   */
  OTA_SEND_EMAIL() {
    return `${environment.apiURL}/users/ota-code`;
  },
  /**
   * Request to reset a user's password
   * @method PATCH
   */
  OTA_RESET_PASSWORD() {
    return `${environment.apiURL}/users/ota-code`;
  },
  /**
   * Request to sign up using Google SSO
   * @method GET
   */
  GOOGLE_SIGNUP() {
    return `${environment.apiURL}/google`;
  },
  /**
   * Request to authenticate a user using Google
   * @method GET
   */
  GOOGLE_REDIRECT() {
    return `${environment.apiURL}/google/redirect`;
  },
};
