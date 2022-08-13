import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse
} from '@angular/common/http';
import { USER_ROUTES } from '@env/route';
import { AuthService } from './auth.service';
import { User } from '@entity';
import * as md5 from 'md5';
import { throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import { UserQuery } from 'app/interfaces/query';

@Injectable()
export class UserService {
  userNotifications: any;
  constructor(private http: HttpClient, private auth: AuthService) {}

  /**
   * Check to see if a user exists for the given username
   *
   * @param {string} username the username of the user to validate
   * @returns {Promise<boolean>}
   * @memberof UserService
   */
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

  /**
   * Fetch a list of user's who are reviewers for the given collection
   *
   * @param {string} collection
   * @param {*} role
   * @returns {Promise<User[]>}
   * @memberof UserService
   */
  fetchReviewers(collection: string): Promise<User[]> {
    return this.http
      .get(USER_ROUTES.FETCH_MEMBERS(collection, { role: 'reviewer' }), {
        withCredentials: true
      })
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

  /**
   * Assigns a user to a specified collection with a specified role
   *
   * @param {string} memberId the id of the user
   * @param {string} collection the abbreviated name of the collection
   * @param {string} role the string representation of the role
   * @returns {Promise<void>}
   * @memberof UserService
   */
  async assignMember(
    memberId: string,
    collection: string,
    role: string
  ): Promise<void> {
    await this.http
      .put(
        USER_ROUTES.ASSIGN_COLLECTION_MEMBER(collection, memberId),
        { role },
        {
          withCredentials: true,
          responseType: 'text'
        }
      )
      .pipe(
        retry(3),
        catchError(this.handleError)
      )
      .toPromise();
  }

  /**
   * Edit's a user's role in a collection
   *
   * @param {string} collection the selected collection
   * @param {string} memberId the id of the user
   * @param {string} role the user's new role in that collection
   * @returns {Promise<User>}
   * @memberof UserService
   */
  editMember(collection: string, memberId: string, role: string): Promise<User> {
    return this.http
      .patch(USER_ROUTES.UPDATE_COLLECTION_MEMBER(collection, memberId), role, {
        withCredentials: true,
        responseType: 'text'
      })
      .pipe(
        retry(3),
        catchError(this.handleError)
      )
      .toPromise()
      .then((res: any) => {
        return new User(res);
      });
  }

  /**
   * Remove a user's privilege from a collection
   *
   * @param {string} collection the collection to remove
   * @param {string} memberId the user who's privilege shall be revoked
   * @returns {Promise<void>}
   * @memberof UserService
   */
  async removeMember(collection: string, memberId: string): Promise<void> {
    await this.http
      .request(
        'delete',
        USER_ROUTES.REMOVE_COLLECTION_MEMBER(collection, memberId),
        {
          withCredentials: true,
          responseType: 'text'
        }
      )
      .pipe(
        retry(3),
        catchError(this.handleError)
      )
      .toPromise();
  }

  /**
   * Performs a text search and returns a list of matching users
   *
   * @param {string} query the text string to query by
   * @returns {Promise<User[]} array of users matching the text query
   * @memberof UserService
   */
  searchUsers(query: UserQuery): Promise<User[]> {
    return this.http
      .get(USER_ROUTES.SEARCH_USERS(query), {
        withCredentials: true
      })
      .pipe(
        retry(3),
        catchError(this.handleError)
      )
      .toPromise()
      .then((val: any) => {
        const arr = val;
        return arr.map(user => new User(user));
      });
  }

  /**
   * Retrieve a list of user's that belong to a given organization
   *
   * @param {string} organization
   * @returns {Promise<User[]>}
   * @memberof UserService
   */
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

  /**
   * Retrieve the gravatar image for a given email at a given size
   *
   * @param {*} email
   * @param {*} imgSize
   * @returns {string}
   * @memberof UserService
   */
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

  /**
   * Retrieve a User object for a given username
   *
   * @param {string} username
   * @returns {Promise<User>}
   * @memberof UserService
   */
  getUser(user: string, q: string): Promise<User> {
    return user && user !== 'undefined'
      ? this.http
          .get(USER_ROUTES.FETCH_USER(user, q), {
            withCredentials: true
          })
          .pipe(
            retry(3),
            catchError(this.handleError)
          )
          .toPromise()
          .then(
            (val: any) => {
              // eslint-disable-next-line @typescript-eslint/naming-convention
              const user_res = val;
              return user_res ? new User(user_res) : null;
            },
            error => {
              return null;
            }
          )
      : Promise.resolve(null);
  }

  getNotifications(username: string, page: number, limit: number): Promise<any> {
    return this.http.get(USER_ROUTES.GET_NOTIFICATIONS({ username, page, limit }), {
      withCredentials: true,
    })
    .toPromise();
  }

  getNotificationCount(username: string) {
    this.http.get(USER_ROUTES.GET_NOTIFICATIONS({ username, page: 1, limit: 1 }), {
      withCredentials: true,
    })
    .toPromise().then((val: any) => {
      this.userNotifications = val;
    });
  }

  deleteNotification(username: string, notificationID: string) {
    const deleteValue = this.http.delete(USER_ROUTES.DELETE_NOTIFICATION({ username, id: notificationID }), {
      withCredentials: true,
    })
    .toPromise();
    this.getNotificationCount(username);
    return deleteValue;
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
