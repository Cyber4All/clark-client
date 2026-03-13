import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LearningObject, User } from '@entity';
import { UserQuery } from 'app/interfaces/query';
import md5 from 'md5';
import { throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from '../auth-module/auth.service';
import { USER_ROUTES } from './user.routes';
import { AbstractControl } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private http: HttpClient, private auth: AuthService) { }

  /**
   * Performs a text search and returns a list of matching users
   *
   * @param {string} query the text string to query by
   * @returns {Promise<User[]>} array of users matching the text query
   * @memberof UserService
   */
  searchUsers(query: UserQuery): Promise<User[]> {
    // TODO(clark-api): Support `organizationId` filter on GET /users so admin organization pages
    // can fetch real per-organization user counts without client-side mock data.
    return this.http
      .get(USER_ROUTES.SEARCH_USERS(query), {
        withCredentials: true,
      })
      .pipe(catchError(this.handleError))
      .toPromise()
      .then((res: {users: any[], total: number}) => {
        return res.users.map((user) => {
          // this matches the _id attribute returned from the service to the client expected userId attribute
          user.userId = user._id;
          return new User(user);
        });
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

  getUser(user: string): Promise<User> {
    return this.http
        .get(USER_ROUTES.GET_USER(user), {
          withCredentials: true,
        })
        .pipe(catchError(this.handleError))
        .toPromise()
        .then(
          (res: any) => {
            return new User(res);
          },
          (error) => {
            return null;
          }
        );
  }

  getUserFileAccessId(username: string): Promise<string> {
    return this.http
      .get(USER_ROUTES.GET_USER_FILE_ACCESS_ID(username), {
        withCredentials: true,
      })
      .pipe(catchError(this.handleError))
      .toPromise()
      .then((fileAccessId: { fileAccessId: string }) => fileAccessId.fileAccessId);
  }

  /**
   * Edit a user's basic information
   *
   * @param {user: { name?: string, email?: string, organization?: string, bio?: string, username: any }} body of updates to user profile
   * @returns http response
   */
  editUserInfo(user: {
    name?: string;
    email?: string;
    organization?: string;
    bio?: string;
    username: any;
  }): Promise<any> {
    return this.http
      .patch(
        USER_ROUTES.UPDATE_USER(user.username),
         user,
        {
          withCredentials: true,
          responseType: 'text',
        }
      )
      .pipe(catchError(this.handleError))
      .toPromise();
  }

  /**
   * Grabs a users profile
   *
   * @param {string} username the username of the user to validate
   * @returns {Promise<Object>} returns user name, email, and bio for profile meta data
   */
  fetchUserProfile(username: string): Promise<any> {
    return this.http
      .get(USER_ROUTES.GET_USER(username), {
        withCredentials: true,
      })
      .pipe(catchError(this.handleError))
      .toPromise();
  }

  /**
   * Validate a user's captcha token
   *
   * @param {string} token the token to verify
   * @returns an object with the result if fail, or null if true.
   */
  validateCaptcha(token: string) {
    return (_: AbstractControl) => {
      return this.http.get(USER_ROUTES.VALIDATE_CAPTCHA(), { params: { token } }).pipe(
        map((res: any) => {
          if (!res.success) {
            return { tokenInvalid: true };
          }
          return null;
        }));
    };
  }

  combineName(firstname: string, lastname: string, combined?: boolean) {
    if (!combined) {
      const firstnameArray = firstname.trim().split(' ');
      const lastnameArray = lastname.trim().split(' ');

      if (firstnameArray.length > 1) {
        let newfirstName = '';
        for (let i = 0; i < firstnameArray.length - 1; i++) {
          newfirstName += firstnameArray[i] + '#';
        }
        newfirstName += firstnameArray[firstnameArray.length - 1];
        firstname = newfirstName;
      }

      if (lastnameArray.length > 1) {
        let newlastName = '';
        for (let i = 0; i < lastnameArray.length - 1; i++) {
          newlastName += lastnameArray[i] + '#';
        }
        newlastName += lastnameArray[lastnameArray.length - 1];
        lastname = newlastName;
      }
      return firstname + ' ' + lastname;
    } else {
      return firstname + ' ' + lastname;
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
