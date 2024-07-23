import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { LEGACY_USER_ROUTES } from '../learning-object-module/learning-object/learning-object.routes';
import { USER_ROUTE } from './user.routes';
import { AuthService } from '../auth-module/auth.service';
import { User } from '@entity';
import * as md5 from 'md5';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { UserQuery } from 'app/interfaces/query';

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
    return this.http
      .get(USER_ROUTE.SEARCH_USERS(query), {
        withCredentials: true,
      })
      .pipe(catchError(this.handleError))
      .toPromise()
      .then((res: {users: any[], total: number}) => {
        return res.users.map((user) => {
          user.userId = user._id;
          return new User(user);
        });
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
    const route = LEGACY_USER_ROUTES.GET_SAME_ORGANIZATION(organization);
    return this.http
      .get(route)
      .pipe(catchError(this.handleError))
      .toPromise()
      .then((val: any) => {
        const arr = val;
        return arr.map((member) => new User(member));
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

  //TO-DO: Remove the q parameter because it won't be used with the new route implementation
  getUser(user: string, q: string): Promise<User> {
    return user && user !== 'undefined'
      ? this.http
        .get(USER_ROUTE.GET_USER(user), {
          withCredentials: true,
        })
        .pipe(catchError(this.handleError))
        .toPromise()
        .then(
          (val: any) => {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            const user_res = val;
            return user_res ? new User(user_res) : null;
          },
          (error) => {
            return null;
          }
        )
      : Promise.resolve(null);
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
        USER_ROUTE.UPDATE_USER(),
        { user },
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
      .get(USER_ROUTE.GET_USER_PROFILE(username), {
        withCredentials: true,
      })
      .pipe(catchError(this.handleError))
      .toPromise();
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
