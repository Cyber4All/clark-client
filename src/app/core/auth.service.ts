import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '@env/environment';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { CookieService } from 'ngx-cookie';
import { User } from '@cyber4all/clark-entity';
import { Subject } from 'rxjs/Subject';
import { Router, NavigationEnd, RouterEvent } from '@angular/router';
import { Http, Headers, ResponseContentType } from '@angular/http';
import { map } from 'rxjs/operator/map';
import * as io from 'socket.io-client';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable()
export class AuthService {
  user: User = undefined;
  // isLoggedIn = new Subject<boolean>();
  headers = new Headers();
  httpHeaders = new HttpHeaders();
  inUse: object;
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
        },
        error => {
          throw error;
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
    // TODO: Delete token specific props
    const user = User.instantiate(val);
    return user;
  }

  establishSocket() {
    if (!this.socketWatcher) {
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
  }

  destroySocket() {
    if (this.socket) {
      this.socket.emit('close');
    }
  }

  printCards() {

    // tslint:disable-next-line:max-line-length
    // FIXME: if this feature stays in the system, this route should be accessed via the gateway
    this.http.get(`http://ec2-34-226-190-22.compute-1.amazonaws.com:3000/users/${this.username}/cards?fname=${this.name.split(' ')[0]}&lname=${this.name.split(' ')[1]}&org=${this.user.organization}`,
      { responseType: 'blob' })
      .toPromise()
      .then(blob => {
        const pdfBlob = new Blob([blob], { type: 'application/pdf' });

        const data = window.URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = data;
        link.target = '_blank';
        link.click();
        setTimeout(function () {
          // For Firefox it is necessary to delay revoking the ObjectURL
          window.URL.revokeObjectURL(data);
        }, 100);
    }, error => {
      throw error;
    });
  }
}
