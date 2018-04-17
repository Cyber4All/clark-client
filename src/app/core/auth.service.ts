import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { CookieService } from 'ngx-cookie';
import { User } from '@cyber4all/clark-entity';
import { Subject } from 'rxjs/Subject';
import { Router, NavigationEnd, RouterEvent } from '@angular/router';
import * as io from 'socket.io-client';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class AuthService {
  user: User = undefined;
  isLoggedIn = new BehaviorSubject<boolean>(false);
  socket;
  socketWatcher: Observable<string>;

  constructor(
    private http: HttpClient,
    private cookies: CookieService,
    private router: Router
  ) {
    if (this.cookies.get('presence')) {
      this.validate().then(
        val => {
          this.changeStatus(true);
        },
        error => {
          this.changeStatus(false);
        }
      );
    }
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
      : this.user.name ? this.user.name.split(' ')[0] : undefined;
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
        },
        error => {
          throw error;
        }
      );
  }

  refreshToken(): Promise<void> {
    return this.http.get(environment.apiURL + '/users/tokens/refresh', { withCredentials: true }).toPromise().then(val => {
      this.user = this.makeUserFromCookieResponse(val);
    }, error => {
      throw error;
    });
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
      });
  }

  register(user: User): Observable<any> {
    return this.http.post(environment.apiURL + '/users', user, {
      withCredentials: true,
      responseType: 'text'
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
    // TODO: Delete token specific props
    let user = User.instantiate(val);
    return user;
  }

  establishSocket() {
    if (!this.socketWatcher) {
      this.socketWatcher = new Observable(observer => {
        this.socket = io(environment.apiURL + '?user=' + this.username);

        this.socket.on('message', (val) => {
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
  }

  destroySocket() {
    if (this.socket) {
      this.socket.emit('close');
    }
  }
}
