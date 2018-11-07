import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '@env/environment';
import { Observable } from 'rxjs/Observable';
import { CookieService } from 'ngx-cookie';
import { User, LearningObject } from '@cyber4all/clark-entity';
import { Headers } from '@angular/http';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Restriction } from '@cyber4all/clark-entity/dist/learning-object';

export enum DOWNLOAD_STATUS {
  CAN_DOWNLOAD = 0,
  NO_AUTH = 1,
  NOT_RELEASED = 2
}

export enum AUTH_GROUP {
  ADMIN,
  USER,
  VISITOR
}

@Injectable()
export class AuthService {
  user: User = undefined;
  headers = new Headers();
  httpHeaders = new HttpHeaders();
  inUse: object;
  isLoggedIn = new BehaviorSubject<boolean>(false);
  socket;
  socketWatcher: Observable<string>;
  whitelist;
  group = new BehaviorSubject<AUTH_GROUP>(AUTH_GROUP.VISITOR);

  constructor(private http: HttpClient, private cookies: CookieService) {
    if (this.cookies.get('presence')) {
      this.validate().then(
        val => {
          this.changeStatus(true);
        },
        error => {
          this.cookies.remove('presence');
          this.changeStatus(false);
        }
      );
    }
    this.fetchWhitelist();
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
    return this.user.name
      ? this.user.name.split(' ')[0]
      : this.user.name
        ? this.user.name.split(' ')[0]
        : undefined;
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

  validate(): Promise<void> {
    return this.http
      .get(environment.apiURL + '/users/tokens', { withCredentials: true })
      .toPromise()
      .then(
        (val: any) => {
          this.user = this.makeUserFromCookieResponse(val);
          this.assignUserToGroup();
        },
        error => {
          throw error;
        }
      );
  }

  checkClientVersion(): Promise<void> {
    // Application version information
    const { version: appVersion } = require('../../../package.json');
    return this.http
      .get(environment.apiURL + '/clientversion/' + appVersion,
        {
          withCredentials: true,
          responseType: 'text'
        })
      .toPromise()
      .then(
        () => {
          return Promise.resolve();
        },
        (error) => {
          if (error.status === 426) {
            return Promise.reject(error);
          }
        }
      );
  }

  refreshToken(): Promise<void> {
    return this.http
      .get(environment.apiURL + '/users/tokens/refresh', {
        withCredentials: true
      })
      .toPromise()
      .then(
        val => {
          this.user = this.makeUserFromCookieResponse(val);
        },
        error => {
          throw error;
        }
      );
  }

  login(user: { username: string; password: string }): Promise<any> {
    return this.http
      .post<User>(environment.apiURL + '/users/tokens', user, {
        withCredentials: true
      })
      .toPromise()
      .then(
        val => {
          this.user = this.makeUserFromCookieResponse(val);
          this.changeStatus(true);
          this.assignUserToGroup();
          return this.user;
        },
        error => {
          this.changeStatus(false);
          this.user = undefined;
          throw error;
        }
      );
  }

  logout(username: string = this.user.username): Promise<void> {
    return this.http
      .delete(environment.apiURL + '/users/' + username + '/tokens', {
        withCredentials: true,
        responseType: 'text'
      })
      .toPromise()
      .then(val => {
        this.user = undefined;
        this.changeStatus(false);
        this.group.next(AUTH_GROUP.VISITOR);
      });
  }

  register(user: User): Promise<User> {
    return this.http.post(environment.apiURL + '/users', user, {
      withCredentials: true,
      responseType: 'text'
    }).toPromise().then(val => {
      this.user = user;
      this.changeStatus(true);
      return this.user;
    }, error => {
      this.changeStatus(false);
      this.user = undefined;
      throw error;
    });
  }

  // checkPassword is used when changing a password in the user-edit-information.component
  checkPassword(password: string): Promise<any> {
    return this.http
      .post<User>(
        environment.apiURL + '/users/password',
        { password },
        {
          withCredentials: true
        }
      )
      .toPromise()
      .then(val => {
        return val;
      });
  }

  initiateResetPassword(email: string): Observable<any> {
    return this.http.post(
      environment.apiURL + '/users/ota-codes?action=resetPassword',
      { email },
      { withCredentials: true, responseType: 'text' }
    );
  }

  resetPassword(payload: string, code: string): Observable<any> {
    return this.http.patch(
      environment.apiURL + '/users/ota-codes?otaCode=' + code,
      { payload },
      { withCredentials: true, responseType: 'text' }
    );
  }

  sendEmailVerification(email: string): Observable<any> {
    return this.http.post(
      environment.apiURL + '/users/ota-codes?action=verifyEmail',
      { email },
      { withCredentials: true, responseType: 'text' }
    );
  }

  identifiersInUse(username: string) {
    return this.http
      .get(
        environment.apiURL + '/users/identifiers/active?username=' + username,
        {
          headers: this.httpHeaders,
          withCredentials: true
          // responseType: 'text'
        }
      )
      .toPromise()
      .then(val => {
        this.inUse = val;
        return this.inUse;
      });
  }

  makeRedirectURL(url: string) {
    if (!url.match(/https?:\/\/.+/i)) {
      return `http://${url}`;
    } else {
      return url;
    }
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
    });
  }

  makeUserFromCookieResponse(val: any): User {
    try {
      const user = User.instantiate(val);
      return user;
    } catch {
      return val as User;
    }
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

  getOrganizations(query: string) {
    return this.http
      .get(
        environment.apiURL + `/users/organizations?query=${encodeURIComponent(query)}`,
        {
          headers: this.httpHeaders,
          withCredentials: true
        }
      )
      .toPromise()
      .then(val => {
        return val;
      });
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
      const restricted = learningObject.lock && learningObject.lock.restrictions.includes(Restriction.DOWNLOAD);

      // If the object is restricted, check if the user is on the whitelist
      if (restricted) {
        if (await this.checkWhitelist()) {
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


  // FIXME: Hotfix for white listing. Remove if functionality is extended or removed
  private async checkWhitelist() {
    try {
      if (this.whitelist === undefined) {
        await this.fetchWhitelist();
      }
      const username = this.username;
      return this.whitelist.includes(username);
    } catch (e) {
      console.log(e);
    }
  }
  private async fetchWhitelist() {
    const response = await fetch(environment.whiteListURL);
    const object = await response.json();
    this.whitelist = object.whitelist;
  }

  /**
   * Checks if the username of the currently logged in user is on the whitelist.
   * If they are then they are an admin, else they are a normal user.
   */
  private assignUserToGroup() {
    this.checkWhitelist().then(isListed => {
      this.group.next(isListed ? AUTH_GROUP.ADMIN : AUTH_GROUP.USER);
    });
  }
}
