import { Injectable } from '@angular/core';
import { ADMIN_ROUTES } from '../../../environments/route';
import { retry, catchError, map } from 'rxjs/operators';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthorshipService {

  constructor(private http: HttpClient) { }

  async changeAuthorship(userId: string, cuid: string, newAuthor: string) {
    return this.http
    .post(ADMIN_ROUTES.CHANGE_AUTHOR(userId, cuid),
    { 
      'fromUserID': userId,
      'toUserID': newAuthor,
      'objectID': cuid,
    },
    { withCredentials: true, responseType: 'text'}
    )
    .pipe(
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
   * @memberof AuthorshipService
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
