import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse
} from '@angular/common/http';
import { PUBLIC_LEARNING_OBJECT_ROUTES, USER_ROUTES } from '@env/route';
import { AuthService } from './auth.service';
import { User } from '@entity';
import * as md5 from 'md5';
import { Observable, of, throwError } from 'rxjs';
import { retry, catchError, take } from 'rxjs/operators';
import { UserQuery } from 'app/interfaces/query';

@Injectable()
export class ProfileService {
  userNotifications: any;
  constructor(private http: HttpClient, private auth: AuthService) {}

  /**
   * Grabs a users profile
   *
   * @param {string} username the username of the user to validate
   * @returns {Promise<boolean>}
   * @memberof UserService
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
   * @param { --- } object tbd
   * @returns {Promise<any>}
   * @memberof UserService
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
   *
   * @param params
   * @returns
   */
  async fetchLearningObject(params: { author: string, cuid: string}): Promise<any> {
    return await this.http
      .get(
        PUBLIC_LEARNING_OBJECT_ROUTES.GET_PUBLIC_LEARNING_OBJECT(params.author, params.cuid),
        {
          withCredentials: true,
          responseType: 'text'
        }
      )
      .pipe(
        retry(3),
        catchError(this.handleError)
      )
      .toPromise()
      .then( val => {
        return JSON.parse(val)[0];
      });
  }

  /**
   *
   * @param username
   * @returns
   */
  async getCollectionData(username: string): Promise<any> {
    return await this.http.get(USER_ROUTES.GET_COLLECTIONS(username), {
      withCredentials: true
    }).toPromise();
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
