import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from './../../../environments/environment';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { CookieService } from 'ngx-cookie';
import { User } from '@cyber4all/clark-entity';
import { Subject } from 'rxjs';
import { Router, NavigationEnd, RouterEvent } from '@angular/router';

@Injectable()
export class AuthService {

  user: User = undefined;
  isLoggedIn = new Subject<boolean>();

  constructor(private http: HttpClient, private cookies: CookieService, private router: Router) {
    if (this.cookies.get('presence')) {
      this.validate().subscribe(val => {
        this.user = <User> val;
        this.isLoggedIn.next(true);
      });
    }

  }

  get name(): string {
    return this.user ? this.user.name : undefined;
  }

  get firstName(): string {
    return this.user.name ? this.user.name.split(' ')[0] : (this.user['_name'] ? this.user['_name'].split(' ')[0] : undefined);
  }

  get email(): string {
    return this.user ? this.user.email : undefined;
  }

  validate(): Observable<User> {
    return this.http.get<User>(environment.apiURL + '/users/tokens', {withCredentials: true});
  }

  login(user: {username: string, password: string}): Promise<any> {
    return this.http.post<User>(environment.apiURL + '/users/tokens', user, {withCredentials: true}).toPromise().then(val => {
      this.user = <User> val;
      this.isLoggedIn.next(true);
      return this.user;
    }, error => {
      this.isLoggedIn.next(false);
      this.user = undefined;
      throw error;
    });
  }

  logout(username: string = this.user.username): Promise<void> {
    return this.http.delete(
      environment.apiURL + '/users/' + username + '/tokens',
      {withCredentials: true, responseType: 'text'}
    ).toPromise().then(val => {
      this.user = undefined;
      this.isLoggedIn.next(false);
    });
  }

  register(
    user: {firstname: string, lastname: string, email: string, username: string, organization: string, password: string}
  ): Observable<any> {
    return this.http.post(environment.apiURL + '/users', user, {withCredentials: true, responseType: 'text'});
  }

  initiateResetPassword(email: string): Observable<any> {
    return this.http.post(
      environment.apiURL + '/users/ota-codes?action=resetPassword',
      {email},
      {withCredentials: true, responseType: 'text'}
    );
  }

  resetPassword(payload: string, code: string): Observable<any> {
    return this.http.patch(
      environment.apiURL + '/users/ota-codes?otaCode=' + code,
      {payload},
      {withCredentials: true, responseType: 'text'});
  }

  makeRedirectURL(url: string) {
    if (!url.match(/https?:\/\/.+/i)) {
      return `http://${url}`;
    } else {
      return url;
    }
  }

  updateInfo (user: {firstname: string, lastname: string, email: string, organization: string}): Observable<any> {
    
    return this.http.patch(
      environment.apiURL + '/users/name', user.firstname,  
      {withCredentials: true, responseType: 'text'});
  }
 }


 //${environment.apiURL}/users/${username}/learning-objects/${learningObjectName}/files`;

 ///email/${email}/organization/${organization}', 