import { Injectable } from '@angular/core';
import { retry, catchError, map } from 'rxjs/operators';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import { ADMIN_ROUTES } from '@env/route';

@Injectable({
  providedIn: 'root'
})
export class PrivilegeService {
  constructor(private http: HttpClient) {}

  /**
   * Fetches roles for specified user
   *
   * @param {string} id [Id of the user to fetch roles for]
   * @returns {Promise<string[]>}
   * @memberof PrivilegeService
   */
  getRoles(id: string): Promise<string[]> {
    return this.http
      .get<{ roles: string[] }>(ADMIN_ROUTES.GET_USER_ROLES(id))
      .pipe(
        retry(3),
        map(data => data.roles),
        catchError(this.handleError)
      )
      .toPromise();
  }
  /**
   * Create a new changelog for the given learning object
   *
   * @param {string} learningObjectId the id of the learning object
   * @param {string} changelog the text body of the changelog
   * @returns {Promise<{}>}
   * @memberof ChangelogService
   */
  addMembership(abvCollectionName: string, userId: string, role: string): Promise<{}> {
    return this.http
      .put(
        ADMIN_ROUTES.MUTATE_COLLECTION_MEMBERSHIP(abvCollectionName, userId),
        { role },
        { withCredentials: true, responseType: 'text' }
      )
      .pipe(
        retry(3),
        catchError(this.handleError)
      )
      .toPromise();
  }

  modifyMembership(abvCollectionName: string, userId: string, role: string) {
    return this.http
      .patch(
        ADMIN_ROUTES.MUTATE_COLLECTION_MEMBERSHIP(abvCollectionName, userId),
        { role },
        { withCredentials: true, responseType: 'text' }
      )
      .pipe(
        retry(3),
        catchError(this.handleError)
      )
      .toPromise();
  }

  removeMembership(abvCollectionName: string, userId: string) {
    return this.http
      .delete(
        ADMIN_ROUTES.MUTATE_COLLECTION_MEMBERSHIP(abvCollectionName, userId),
        { withCredentials: true, responseType: 'text' }
      )
      .pipe(
        retry(3),
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
