import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { environment } from '@env/environment';
import { Observable ,  BehaviorSubject, throwError } from 'rxjs';
import { CookieService } from 'ngx-cookie';
import { User, LearningObject } from '@cyber4all/clark-entity';
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
  socket;
  socketWatcher: Observable<string>;
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

  private changeStatus(status: boolean) {
    if (this.isLoggedIn.getValue() !== status) {
      this.isLoggedIn.next(status);
    }
  }

  get name(): string {
    return this.user ? this.user.name : undefined;
  }

  get firstName(): string {
    return this.user ? this.user.name.split(' ')[0] : undefined;
  }

  get email(): string {
    return this.user ? this.user.email : undefined;
  }

  get status(): boolean {
    return this.user ? true : false;
  }

  get username(): string {
    return this.user ? this.user.username : undefined;
  }

  get accessGroups(): string[] {
    return this.user ? this.user.accessGroups : [];
  }

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
      throw error;
    }
  }

  async checkClientVersion(): Promise<void> {
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

  async refreshToken(): Promise<void> {
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
      throw error;
    }
  }

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
      throw error;
    }
  }

  async logout(username: string = this.user.username): Promise<void> {
    await this.http
      .delete(environment.apiURL + '/users/' + username + '/tokens', {
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
      throw error;
    }
  }

  // checkPassword is used when changing a password in the user-edit-information.component
  async checkPassword(password: string): Promise<any> {
    const val = await this.http
      .post<User>(environment.apiURL + '/users/password', { password }, {
        withCredentials: true
      })
      .pipe(
        retry(3),
        catchError(this.handleError)
      )
      .toPromise();
    return val;
  }

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

  sendEmailVerification(email: string): Observable<any> {
    return this.http.post(
      environment.apiURL + '/users/ota-codes?action=verifyEmail',
      { email },
      { withCredentials: true, responseType: 'text' }
    )
    .pipe(
      retry(3),
      catchError(this.handleError)
    );
  }

  async identifiersInUse(username: string) {
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

  establishSocket() {
    /* if (!this.socketWatcher) {
      this.socketWatcher = new Observable(observer => {
        this.socket = io(environment.apiURL + '?user=' + this.username);

        this.socket.on('message', val => {
          if (val === 'VERIFIED_EMAIL') {
            this.validate().then(() => {
              if (!this.user.emailVerfied) {
                // the link must have been clicked in a different browser, let's refresh the token
                this.refreshToken().then(() => {
                  observer.next('VERIFIED_EMAIL');
                  this.destroySocket();
                });
              }
            });
          }
        });
      });
    }
    return this.socketWatcher;
    */
    return new Observable();
  }

  destroySocket() {
    if (this.socket) {
      this.socket.emit('close');
    }
  }

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
  async userCanDownload(learningObject: LearningObject): Promise<number> {
    if (environment.production) {
      // Check that the object does not contain a download lock and the user is logged in
      const restricted = learningObject.lock && learningObject.lock.restrictions.includes(LearningObject.Restriction.DOWNLOAD);

      // If the object is restricted, check if the user is a reviewer or admin
      if (restricted) {
        if (this.user['accessGroups'].includes('admin') || this.user['accessGroups'].includes('reviewer')) {
          return DOWNLOAD_STATUS.CAN_DOWNLOAD;
        } else {
          return DOWNLOAD_STATUS.NOT_RELEASED;
        }
      }

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
    return this.group.getValue() > AUTH_GROUP.REVIEWER;
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
      return throwError(error.error.message);
    } else {
      // API returned error
      return throwError(error);
    }
  }
}
