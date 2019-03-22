import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { USER_ROUTES } from '@env/route';
import { AuthService } from './auth.service';
import { UserEdit } from '../cube/user-profile/user-edit-information/user-edit-information.component';
import { User } from '@cyber4all/clark-entity';
import * as md5 from 'md5';
import { Observable, throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';

@Injectable()
export class UserService {
  socket;
  socketWatcher: Observable<string>;
  constructor(private http: HttpClient, private auth: AuthService) {
  }

  editUserInfo(user: UserEdit): Promise<any> {
    return this.http
      .patch(
        USER_ROUTES.EDIT_USER_INFO,
        { user },
        {
          withCredentials: true, responseType: 'text'
        }
      )
      .pipe(
        retry(3),
        catchError(this.handleError)
      )
      .toPromise();
  }

  validateUser(username: string): Promise<boolean> {
    return username && username !== 'undefined'
      ? this.http
          .get(USER_ROUTES.CHECK_USER_EXISTS(username), {
            withCredentials: true
          })
          .pipe(
            retry(3),
            catchError(this.handleError)
          )
          .toPromise()
          .then(
            (val: any) => {
              return val ? true : false;
            },
            error => {
              console.error(error);
              return false;
            }
          )
      : Promise.resolve(false);
  }

  fetchReviewers(collection: string, role: any): Promise<User[]> {
    return this.http
      .get(
        USER_ROUTES.FETCH_MEMBERS(collection, role),
        {
          withCredentials: true
        }
      )
      .pipe(
        retry(3),
        catchError(this.handleError)
      )
      .toPromise()
      .then((val: any) => {
        const arr = val;
        return arr.map(member => new  User(member));
      });
  }

  /**
   * Performs a text search and returns a list of matching users
   *
   * @param {string} query the text string to query by
   * @returns {Promise<User[]} array of users matching the text query
   * @memberof UserService
   */
  searchUsers(query: string): Promise<User[]> {
    return this.http
      .get(
        USER_ROUTES.SEARCH_USERS(query),
        {
          withCredentials: true
        }
      )
      .pipe(
        retry(3),
        catchError(this.handleError)
      )
      .toPromise()
      .then((val: any) => {
        const arr = val;
        return arr.map(member => new  User(member));
      });
  }

  getOrganizationMembers(organization: string): Promise<User[]> {
    const route = USER_ROUTES.GET_SAME_ORGANIZATION(organization);
    return this.http
      .get(route)
      .pipe(
        retry(3),
        catchError(this.handleError)
      )
      .toPromise()
      .then((val: any) => {
        const arr = val;
        return arr.map(member => new User(member));
      });
  }

  getGravatarImage(email, imgSize): string {
    const defaultIcon = 'identicon';
    // r=pg checks the rating of the Gravatar image
    return (
      'https://www.gravatar.com/avatar/' +
      md5(email) +
      '?s=' +
      imgSize +
      '?r=pg&d=' +
      defaultIcon
    );
  }

  getUser(username: string): Promise<User> {
    return username && username !== 'undefined'
      ? this.http
          .get(USER_ROUTES.CHECK_USER_EXISTS(username), {
            withCredentials: true
          })
          .pipe(
            retry(3),
            catchError(this.handleError)
          )
          .toPromise()
          .then(
            (val: any) => {
              const user = val;
              return user ? new User(user) : null;
            },
            error => {
              return null;
            }
          )
      : Promise.resolve(null);
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
