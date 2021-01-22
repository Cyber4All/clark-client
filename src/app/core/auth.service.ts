import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpHeaders,
  HttpErrorResponse
} from '@angular/common/http';
import { environment } from '@env/environment';
import { Observable, BehaviorSubject, throwError, of } from 'rxjs';
import { CookieService } from 'ngx-cookie';
import { User, LearningObject } from '@entity';
import { catchError, retry } from 'rxjs/operators';

export enum DOWNLOAD_STATUS {
  CAN_DOWNLOAD = 0,
  NO_AUTH = 1,
  NOT_RELEASED = 2
}

export enum AUTH_GROUP {
  VISITOR,
  USER,
  REVIEWER,
  CURATOR,
  EDITOR,
  ADMIN
}

export interface Tokens {
  bearer: string;
  openId: OpenIdToken;
}

export class AuthUser extends User {
  accessGroups: string[];
}

export interface OpenIdToken {
  IdentityId: string;
  Token: string;
}

// Location of logged in user's access tokens in local storage
const TOKEN_STORAGE_KEY = 'clark.center:access-tokens';

@Injectable()
export class AuthService {
  user: AuthUser;
  httpHeaders = new HttpHeaders();
  inUse: object;
  isLoggedIn = new BehaviorSubject<boolean>(false);
  group = new BehaviorSubject<AUTH_GROUP>(AUTH_GROUP.VISITOR);
  private openIdToken: OpenIdToken;

  constructor(private http: HttpClient, private cookies: CookieService) {
    if (this.cookies.get('presence')) {
      this.validateAndRefreshToken();
    }
  }

  /**
   * Stores and sets:
   * User data of logged of logged in user
   * OpenId token of logged in user
   * Logged in status to true
   * Access group of logged in user
   * Access token in local storage
   *
   * @private
   * @param {AuthUser} user [User data for the logged in user]
   * @param {Tokens} tokens [Access tokens for the logged in user]
   * @memberof AuthService
   */
  private setSession({ user, tokens }: { user: AuthUser; tokens: Tokens }) {
    this.user = user;
    this.openIdToken = tokens.openId;
    this.changeStatus(true);
    this.assignUserToGroup();
    localStorage.setItem(
      TOKEN_STORAGE_KEY,
      JSON.stringify({ bearer: tokens.bearer, openId: tokens.openId })
    );
  }

  /**
   * Unset session related data
   * User data from previously logged in user is cleared from memory
   * OpenId token is cleared from memory
   * The presence cookie is removed from the browser
   * Logged in status is set to false
   * The user's access group is set to vistor
   * All tokens are cleared from local storage
   *
   * @private
   * @memberof AuthService
   */
  private endSession() {
    this.user = null;
    this.openIdToken = null;
    this.cookies.remove('presence');
    this.changeStatus(false);
    this.group.next(AUTH_GROUP.VISITOR);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  }

  /**
   * Retrieves tokens from local storage
   *
   * @private
   * @returns {Partial<Tokens>}
   * @memberof AuthService
   */
  private getTokens(): Partial<Tokens> {
    const storageItem = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (storageItem) {
      return JSON.parse(storageItem) as Partial<Tokens>;
    }
    return null;
  }

  /**
   * Retrieves OpenId token from memory or storage if not in memory
   *
   * @returns {OpenIdToken}
   * @memberof AuthService
   */
  public getOpenIdToken(): OpenIdToken {
    if (!this.openIdToken) {
      const tokens = this.getTokens();
      if (tokens) {
        this.openIdToken = tokens.openId;
      }
    }
    return this.openIdToken;
  }

  /**
   * Checks if user's group equals admin or editor
   *
   * @returns {boolean}
   * @memberof AuthService
   */
  public isAdminOrEditor(): boolean {
    return (
      this.group.value === AUTH_GROUP.ADMIN ||
      this.group.value === AUTH_GROUP.EDITOR
    );
  }

  /**
   * Checks if user's group equals admin
   * @returns {boolean}
   * @memberof AuthService
   */
  public isAdmin(): boolean {
    return this.group.value === AUTH_GROUP.ADMIN;
  }

  /**
   * Set's the user's logged-in status
   *
   * @private
   * @param {boolean} status whether or not the user is logged in
   * @memberof AuthService
   */
  private changeStatus(status: boolean) {
    if (this.isLoggedIn.getValue() !== status) {
      this.isLoggedIn.next(status);
    }
  }

  /**
   * Return the currently logged-in user's full name
   *
   * @readonly
   * @type {string}
   * @memberof AuthService
   */
  get name(): string {
    return this.user ? this.user.name : undefined;
  }

  /**
   * Return the currently logged-in user's first name
   *
   * @readonly
   * @type {string}
   * @memberof AuthService
   */
  get firstName(): string {
    return this.user ? this.user.name.split(' ')[0] : undefined;
  }

  /**
   * Return the currently logged-in user's email address
   *
   * @readonly
   * @type {string}
   * @memberof AuthService
   */
  get email(): string {
    return this.user ? this.user.email : undefined;
  }

  /**
   * Return the status of the application, either true for authenticated or false for public
   *
   * @readonly
   * @type {boolean}
   * @memberof AuthService
   */
  get status(): boolean {
    return this.user ? true : false;
  }

  /**
   * Return the currently logged-in user's username
   *
   * @readonly
   * @type {string}
   * @memberof AuthService
   */
  get username(): string {
    return this.user ? this.user.username : undefined;
  }

  /**
   * Return the currently logged-in user's access groups
   *
   * @readonly
   * @type {string[]}
   * @memberof AuthService
   */
  get accessGroups(): string[] {
    return this.user ? this.user.accessGroups : [];
  }

  /**
   * Validate the current token against the service
   * If the token is valid. The current logged in user's data is updated with the service's response payload
   * If the token is invalid, the current user's session is ended.
   *
   * @returns {Promise<void>}
   * @memberof AuthService
   */
  async validateAndRefreshToken(): Promise<void> {
    try {
      const response = await this.http
        .get<AuthUser>(environment.apiURL + '/users/tokens', {
          withCredentials: true
        })
        .pipe(
          retry(3),
          catchError(this.handleError)
        )
        .toPromise();
      this.user = response;
      this.assignUserToGroup();
      this.changeStatus(true);
    } catch (error) {
      this.endSession();
      throw error;
    }
  }

  /**
   * Checks the client's version against the service
   *
   * @returns {Promise<void>}
   * @memberof AuthService
   */
  async checkClientVersion(): Promise<void | Partial<{ message: string }>> {
    // Application version information
    const { version: appVersion } = require('../../../package.json');
    try {
      await this.http
        .get(environment.apiURL + '/clientversion/' + appVersion, {
          withCredentials: true,
          responseType: 'text'
        })
        .pipe(
          retry(3)
        )
        .toPromise();
      return Promise.resolve();
    } catch (error) {
      if (error.status === 426) {
        return Promise.reject(error);
      } else {
        catchError(this.handleError);
      }
    }
  }

  /**
   * Retrieves a new token for the active user
   *
   * @returns {Promise<void>}
   * @memberof AuthService
   */
  async refreshToken(): Promise<void | Partial<{ message: string }>> {
    try {
      const response = await this.http
        .get<AuthUser & { tokens: Tokens }>(
          environment.apiURL + '/users/tokens/refresh',
          {
            withCredentials: true
          }
        )
        .pipe(
          retry(3),
          catchError(this.handleError)
        )
        .toPromise();
      const tokens: Tokens = response.tokens;
      delete response.tokens;
      const user: AuthUser = response as AuthUser;
      this.setSession({ user, tokens });
    } catch (error) {
      return Promise.reject(error);
    }
  }

  /**
   * Logs a user in
   *
   * @param {{ username: string; password: string }} user an object containing the plain text username and password to attempt login
   * @returns {Promise<any>}
   * @memberof AuthService
   */
  async login(user: { username: string; password: string }): Promise<any> {
    try {
      const response = await this.http
        .post<AuthUser & { tokens: Tokens }>(
          environment.apiURL + '/users/tokens',
          user,
          {
            withCredentials: true
          }
        )
        .pipe(
          retry(3),
          catchError(this.handleError)
        )
        .toPromise();

      const tokens: Tokens = response.tokens;
      delete response.tokens;
      const authUser: AuthUser = response as AuthUser;
      this.setSession({ user: authUser, tokens });
      return this.user;
    } catch (error) {
      this.endSession();
      throw error;
    }
  }

  /**
   * Logs the current user out
   *
   * @returns {Promise<void>}
   * @memberof AuthService
   */
  async logout(): Promise<void> {
    this.http
      .delete(environment.apiURL + '/users/' + this.user.username + '/tokens', {
        withCredentials: true,
        responseType: 'text'
      })
      .pipe(
        retry(3),
        catchError(this.handleError)
      )
      .toPromise().then(() => {
        this.endSession();

        // push reload to end of execution context
        setTimeout(() => {
          window.location.reload();
        });
      });
  }

  /**
   * Creates a new user
   *
   * @param user the user's data from the registration component
   */
  async register(user: any): Promise<User> {
    try {
      const response = await this.http
        .post<AuthUser & { tokens: Tokens }>(
          environment.apiURL + '/users',
          user,
          {
            withCredentials: true
          }
        )
        .pipe(
          retry(3),
          catchError(this.handleError)
        )
        .toPromise();
      const tokens: Tokens = response.tokens;
      delete response.tokens;
      const authUser: AuthUser = response as AuthUser;
      this.setSession({ user: authUser, tokens });
      return this.user;
    } catch (error) {
      this.endSession();
      throw error;
    }
  }

  /**
   * Begins the password reset process by sending an email to the specified email address
   *
   * @param {string} email
   * @returns {Observable<any>}
   * @memberof AuthService
   */
  initiateResetPassword(email: string): Observable<any> {
    return this.http
      .post(
        environment.apiURL + '/users/ota-codes?action=resetPassword',
        { email },
        { withCredentials: true, responseType: 'text' }
      )
      .pipe(
        retry(3),
        catchError(this.handleError)
      );
  }

  /**
   * Resets a user's password and deletes the corresponding OTA code
   *
   * @param {string} payload the new password
   * @param {string} code the original one-time code that corresponds to the password-reset request
   * @returns {Observable<any>}
   * @memberof AuthService
   */
  resetPassword(payload: string, code: string): Observable<any> {
    return this.http
      .patch(
        environment.apiURL + '/users/ota-codes?otaCode=' + code,
        { payload },
        { withCredentials: true, responseType: 'text' }
      )
      .pipe(
        retry(3),
        catchError(this.handleError)
      );
  }

  /**
   * Sends a password verification email to the specified email address
   *
   * @param {string} [email]
   * @returns {Observable<any>}
   * @memberof AuthService
   */
  sendEmailVerification(email?: string): Observable<any> {
    return this.http
      .post(
        environment.apiURL + '/users/ota-codes?action=verifyEmail',
        { email: email || this.user.email },
        { withCredentials: true, responseType: 'text' }
      )
      .pipe(
        retry(3),
        catchError(this.handleError)
      );
  }

  /**
   * Determines whether or not the specified username is currently in use
   *
   * @param {string} username
   * @returns
   * @memberof AuthService
   */
  async usernameInUse(username: string) {
    const val = await this.http
      .get(
        environment.apiURL + '/users/identifiers/active?username=' + username,
        {
          headers: this.httpHeaders,
          withCredentials: true
        }
      )
      .pipe(
        retry(3),
        catchError(this.handleError)
      )
      .toPromise();
    this.inUse = val;
    return this.inUse;
  }

  /**
   * Udates a user's information with the specified data
   *
   * @param {{
   *     firstname: string;
   *     lastname: string;
   *     email: string;
   *     organization: string;
   *   }} user
   * @returns {Observable<any>}
   * @memberof AuthService
   */
  updateInfo(user: {
    firstname: string;
    lastname: string;
    email: string;
    organization: string;
  }): Observable<any> {
    return this.http
      .patch(environment.apiURL + '/users/name', user.firstname, {
        withCredentials: true,
        responseType: 'text'
      })
      .pipe(
        retry(3),
        catchError(this.handleError)
      );
  }

  /**
   * Determines whether or not the currently logged-in user can download the specified learning object
   *
   * @param {LearningObject} learningObject
   * @returns {Promise<number>}
   * @memberof AuthService
   */
  async userCanDownload(learningObject: LearningObject): Promise<number> {
    if (environment.production) {
      // Check that the user is logged in

      if (!this.isLoggedIn.getValue()) {
        // user isn't logged in
        return DOWNLOAD_STATUS.NO_AUTH;
      }

      return DOWNLOAD_STATUS.CAN_DOWNLOAD;
    } else {
      return DOWNLOAD_STATUS.CAN_DOWNLOAD;
    }
  }

  /**
   * Identifies if the current logged in user has reviewer privileges.
   */
  hasReviewerAccess(): boolean {
    return this.group.getValue() > AUTH_GROUP.USER;
  }

  /**
   * Identifies if the current logged in user has curator privileges
   *
   * @returns {boolean}
   * @memberof AuthService
   */
  public hasCuratorAccess(): boolean {
    return this.group.getValue() > AUTH_GROUP.REVIEWER;
  }

  /**
   * Identifies if the current logged in user has editor privileges.
   */
  public hasEditorAccess(): boolean {
    return this.group.getValue() > AUTH_GROUP.CURATOR;
  }

  /**
   * Assigns an authorization group to a user based on their access groups.
   * The highest priority group will be assigned.
   */
  private assignUserToGroup() {
    if (!this.user.accessGroups) {
      return;
    }

    // Since the service will only pull down objects the authenticated user is authorized to see, we don't need
    // to check the collection in the case of reviewers and curators. We can strip the collections from the roles
    // in the access groups for ease of comparison.
    const groups = this.user.accessGroups.map(x => x.split('@')[0]);

    if (groups.includes('admin')) {
      this.group.next(AUTH_GROUP.ADMIN);
      return;
    } else if (groups.includes('editor')) {
      this.group.next(AUTH_GROUP.EDITOR);
      return;
    } else if (groups.includes('curator')) {
      this.group.next(AUTH_GROUP.CURATOR);
      return;
    } else if (groups.includes('reviewer')) {
      this.group.next(AUTH_GROUP.REVIEWER);
      return;
    } else {
      this.group.next(AUTH_GROUP.USER);
    }
  }

  private handleError(error: HttpErrorResponse) {
    if (
      error.error instanceof ErrorEvent ||
      (error.error && error.error.message)
    ) {
      // Client-side or network returned error
      return throwError(error.error);
    } else {
      // API returned error
      return throwError(error.error);
    }
  }
}
