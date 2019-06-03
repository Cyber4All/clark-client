import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { environment } from '@env/environment';
import { Observable ,  BehaviorSubject, throwError } from 'rxjs';
import { CookieService } from 'ngx-cookie';
import { User, LearningObject } from '@entity';
import { Headers } from '@angular/http';
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

export interface AuthUser extends User {
  accessGroups: string[];
}

@Injectable()
export class AuthService {
  user: AuthUser;
  headers = new Headers();
  httpHeaders = new HttpHeaders();
  inUse: object;
  isLoggedIn = new BehaviorSubject<boolean>(false);
  group = new BehaviorSubject<AUTH_GROUP>(AUTH_GROUP.VISITOR);

  constructor(private http: HttpClient, private cookies: CookieService) {
    if (this.cookies.get('presence')) {
      this.validate().then(
        _ => {
          this.changeStatus(true);
        },
        _ => {
          this.cookies.remove('presence');
          this.changeStatus(false);
        }
      );
    }
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
   * Validate the current cookie against the service
   *
   * @returns {Promise<void>}
   * @memberof AuthService
   */
  async validate(): Promise<void> {
    try {
      const response = await this.http
        .get(environment.apiURL + '/users/tokens', { withCredentials: true })
        .pipe(
          retry(3),
          catchError(this.handleError)
        )
        .toPromise();
      this.user = response as AuthUser;
      this.assignUserToGroup();
    } catch (error) {
      return Promise.reject(error);
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
          retry(3),
          catchError(this.handleError)
        )
        .toPromise();
      return Promise.resolve();
    } catch (error) {
      if (error.status === 426) {
        return Promise.reject(error);
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
      const val = await this.http
        .get(environment.apiURL + '/users/tokens/refresh', {
          withCredentials: true
        })
        .pipe(
          retry(3),
          catchError(this.handleError)
        )
        .toPromise();
      this.user = val as AuthUser;
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
      const val = await this.http
        .post<User>(environment.apiURL + '/users/tokens', user, {
          withCredentials: true
        })
        .pipe(
          retry(3),
          catchError(this.handleError)
        )
        .toPromise();
      this.user = val as AuthUser;
      this.changeStatus(true);
      this.assignUserToGroup();
      return this.user;
    } catch (error) {
      this.changeStatus(false);
      this.user = undefined;
      return Promise.reject(error);
    }
  }

  /**
   * Logs the current user out
   *
   * @returns {Promise<void>}
   * @memberof AuthService
   */
  async logout(): Promise<void> {
    await this.http
      .delete(environment.apiURL + '/users/' + this.username + '/tokens', {
        withCredentials: true,
        responseType: 'text'
      })
      .pipe(
        retry(3),
        catchError(this.handleError)
      )
      .toPromise();
    this.user = undefined;
    this.changeStatus(false);
    this.group.next(AUTH_GROUP.VISITOR);
    window.location.reload();
  }

  /**
   * Creates a new user
   *
   * @param user the user's data from the registration component
   */
  async register(user: any): Promise<User> {
    try {
      await this.http.post(environment.apiURL + '/users', user, {
        withCredentials: true,
        responseType: 'text'
      })
      .pipe(
        retry(3),
        catchError(this.handleError)
      )
      .toPromise();
      this.user = user;
      this.changeStatus(true);
      return this.user;
    } catch (error) {
      this.changeStatus(false);
      this.user = undefined;
      return Promise.reject(error);
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
    return this.http.post(
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
    return this.http.patch(
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
    return this.http.post(
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
      .get(environment.apiURL + '/users/identifiers/active?username=' + username, {
        headers: this.httpHeaders,
        withCredentials: true
      })
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
    return this.http.patch(environment.apiURL + '/users/name', user.firstname, {
      withCredentials: true,
      responseType: 'text'
    })
    .pipe(
      retry(3),
      catchError(this.handleError)
    );
  }

  /**
   * Triggers a print operation for CLARK cards with the specified username, name and organization
   *
   * @param {string} username
   * @param {string} name
   * @param {string} organization
   * @memberof AuthService
   */
  printCards(username: string, name: string, organization: string) {
    const uppercase = (word: string): string => word.charAt(0).toUpperCase() + word.slice(1);
    // Format user information
    const nameSplit = name.split(' ');
    const firstname = uppercase(nameSplit[0]);
    const lastname = uppercase(nameSplit.slice(1, nameSplit.length).join(' '));
    const org = organization.split(' ').map(word => uppercase(word)).join(' ');

    // Create and click a tag to open new tab
    const newlink = document.createElement('a');
    newlink.setAttribute('target', '_blank');
    newlink.setAttribute('href', `https://api-gateway.clark.center/users/${encodeURIComponent(
      username
    )}/cards?fname=${encodeURIComponent(
      firstname
    )}&lname=${encodeURIComponent(lastname)}&org=${encodeURIComponent(
      org
    )}`);
    newlink.click();
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
    if (!this.user['accessGroups']) {
      return;
    }

    // Since the service will only pull down objects the authenticated user is authorized to see, we don't need
    // to check the collection in the case of reviewers and curators. We can strip the collections from the roles
    // in the access groups for ease of comparison.
    const groups = this.user['accessGroups'].map(x => x.split('@')[0]);

    if (groups.includes('admin')) {
      this.group.next(AUTH_GROUP.ADMIN);
    } else if (groups.includes('editor')) {
      this.group.next(AUTH_GROUP.EDITOR);
    } else if (groups.includes('reviewer')) {
      this.group.next(AUTH_GROUP.REVIEWER);
    } else if (groups.includes('curator')) {
      this.group.next(AUTH_GROUP.CURATOR);
    } else {
      this.group.next(AUTH_GROUP.USER);
    }
  }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // Client-side or network returned error
      return throwError(error.error);
    } else {
      // API returned error
      return throwError(error.error);
    }
  }
}
