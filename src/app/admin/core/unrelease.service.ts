import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LearningObject } from '@entity';
import { ADMIN_ROUTES } from '@env/route';
import { throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UnreleaseService {

  constructor(private http: HttpClient) { }

  /**
   * Unreleases a learning object, moving it back to a
   * in review status (waiting, review, or proofing)
   *
   * @param username The username of the author
   * @param cuid The cuid of the learning object
   * @returns A promise of the request
   */
  unreleaseLearningObject(username: string, cuid: string) {
    return this.http
      .post(
        ADMIN_ROUTES.UNRELEASE_OBJECT(username, cuid),
        { status: LearningObject.Status.UNRELEASED },
        { withCredentials: true, responseType: 'text'}
      ).pipe(
        retry(3),
        catchError(this.handleError)
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
