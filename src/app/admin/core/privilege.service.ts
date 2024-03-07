import { Injectable } from '@angular/core';
import { retry, catchError, map } from 'rxjs/operators';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import { LEGACY_ADMIN_ROUTES } from '../../core/learning-object-module/learning-object/learning-object.routes';

@Injectable({
  providedIn: 'root'
})
export class PrivilegeService {
  constructor(private http: HttpClient) { }

  /**
   * Fetches roles for specified user
   *
   * @param {string} id [Id of the user to fetch roles for]
   * @returns {Promise<string[]>}
   * @memberof PrivilegeService
   */
  getCollectionRoles(id: string): Promise<string[]> {
    return this.http
      .get<{ roles: string[] }>(LEGACY_ADMIN_ROUTES.GET_USER_ROLES(id))
      .pipe(

        map(data => data.roles),
        catchError(this.handleError)
      )
      .toPromise();
  }

  /**
   * Adds membership at a specific role for a collection to a user
   *
   * @param {string} abvCollectionName the abbreviated name of the collection for which to add the membership
   * @param {string} userId the id of the user to grant membership to
   * @param {string} role the role the user will hold in the collection
   * @returns {Promise<{}>}
   * @memberof PrivilegeService
   */
  addCollectionMembership(abvCollectionName: string, userId: string, role: string): Promise<{}> {
    return this.http
      .put(
        LEGACY_ADMIN_ROUTES.MUTATE_COLLECTION_MEMBERSHIP(abvCollectionName, userId),
        { role },
        { withCredentials: true, responseType: 'text' }
      )
      .pipe(

        catchError(this.handleError)
      )
      .toPromise();
  }

  /**
   * Removes a users membership from a specific collection
   *
   * @param {string} abvCollectionName the abbreviated name of the collection for which to remove the membership
   * @param {string} userId the id of the user to remove membership for
   * @returns
   * @memberof PrivilegeService
   */
  removeCollectionMembership(abvCollectionName: string, userId: string) {
    return this.http
      .delete(
        LEGACY_ADMIN_ROUTES.MUTATE_COLLECTION_MEMBERSHIP(abvCollectionName, userId),
        { withCredentials: true, responseType: 'text' }
      )
      .pipe(

        catchError(this.handleError)
      )
      .toPromise();
  }

  getMappers() {
    return this.http
      .get(
        LEGACY_ADMIN_ROUTES.GET_MAPPERS(),
        { withCredentials: true }
      )
      .toPromise();
  }

  /**
   * Generic error-handling function for errors through from the HttpClient module
   *
   * @private
   * @param {HttpErrorResponse} error
   * @returns
   * @memberof PrivilegeService
   */
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
