import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse
} from '@angular/common/http';
import { PUBLIC_LEARNING_OBJECT_ROUTES, USER_ROUTES } from '@env/route';
import { AuthService } from './auth.service';
import { throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';

@Injectable()
export class ProfileService {
  userNotifications: any;
  constructor(private http: HttpClient, private auth: AuthService) {}

  /**
   * Grabs a users profile
   *
   * @param {string} username the username of the user to validate
   * @returns {Promise<Object>} returns user name, email, and bio for profile meta data
   */
  fetchUserProfile(username: string): Promise<any> {
    return this.http
      .get(USER_ROUTES.FETCH_USER_PROFILE(username), {
        withCredentials: true
      })
      .pipe(
        retry(3),
        catchError(this.handleError)
      )
      .toPromise();
  }

  /**
   * Edit a user's basic information
   *
   * @param { user:{ name?: string, }} tbd
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
        USER_ROUTES.EDIT_USER_INFO,
        { user },
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
   * Function to retrieve a learning object's metadata
   *
   * @param params
   * @returns
   */
  fetchLearningObject(params: { author: string, cuid: string}): Promise<any> {
    return this.http
      .get(
        PUBLIC_LEARNING_OBJECT_ROUTES.GET_PUBLIC_LEARNING_OBJECT(params.author, params.cuid),
        {
          withCredentials: true,
          responseType: 'text'
        }
      )
      .pipe(
        catchError(this.handleError)
      )
      .toPromise()
      .then( val => {
        return JSON.parse(val)[0];
      });
  }

  /**
   * Service call to retrieve collection meta data for all objects for a particular user
   *
   * @param username username of the user's profile being accessed
   * @returns {cuid: string, version: int, status: string, collection: string} object metadata
   * for each collection an object belongs to for a user
   */
  getCollectionData(username: string): Promise<any> {
    return this.http.get(USER_ROUTES.GET_COLLECTIONS(username), {
      withCredentials: true
    })
    .pipe(
      catchError(this.handleError)
    )
    .toPromise();
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
