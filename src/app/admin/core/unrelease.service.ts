import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LearningObject } from '@entity';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { REVISION_ROUTES } from '../../core/learning-object-module/revisions/revisions.routes';

@Injectable({
  providedIn: 'root',
})
export class UnreleaseService {
  constructor(private http: HttpClient) {}
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
