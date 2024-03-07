import { Injectable } from '@angular/core';
import { ACCESS_GROUP_ROUTES } from './access-group.routes';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../auth-module/auth.service';
import { User } from '@entity';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const AccessGroups = {
  ADMIN: 'admin',
  EDITOR: 'editor',
  MAPPER: 'mapper',
  REVIEWER: 'reviewer',
  CURATOR: 'curator',
  REVIEWER_COLLECTION: (collectionName: string): string =>
      `reviewer@${collectionName}`,
  CURATOR_COLLECTION: (collectionName: string): string =>
      `curator@${collectionName}`,
};

@Injectable({
  providedIn: 'root'
})
export class AccessGroupService {
  constructor(private http: HttpClient, private auth: AuthService) { }

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
      .get(ACCESS_GROUP_ROUTES.FETCH_REVIEWERS(collection), {
        withCredentials: true,
      })
      .pipe(catchError(this.handleError))
      .toPromise()
      .then((val: any) => {
        const arr = val;
        return arr.map((member) => new User(member));
      });
  }

  /**
   * Adds a an access group to a user
   *
   * @param {string} username the username of the user
   * @param {string} accessGroup the string representation of the access group
   * @param {string} collection the abbreviated name of the collection
   * @returns {Promise<void>}
   */
  async addAccessGroupToUser(
    username: string,
    accessGroup: string,
    collection?: string,
  ): Promise<void> {
    await this.http
      .post(
        ACCESS_GROUP_ROUTES.ADD_ACCESS_GROUP_TO_USER(username),
        { accessGroup, collection },
        {
          withCredentials: true,
          responseType: 'text',
        }
      )
      .pipe(catchError(this.handleError))
      .toPromise();
  }

  /**
   * Removes a user from an access group
   *
   * @param {string} username the username of the user
   * @param {string} accessGroup the string representation of the access group
   * @param {string} collection the abbreviated name of the collection
   * @returns {Promise<void>}
   */
  async removeAccessGroupFromUser(
    username: string,
    accessGroup: string,
    collection?: string
  ): Promise<void> {
    await this.http
      .patch(
        ACCESS_GROUP_ROUTES.REMOVE_ACCESS_GROUP_FROM_USER(username),
        { accessGroup, collection },
        {
          withCredentials: true,
          responseType: 'text',
        }
      )
      .pipe(catchError(this.handleError))
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
