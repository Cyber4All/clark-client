import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ADMIN_ROUTES } from '@env/route';
import { retry, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable()
export class ChangelogService {

  constructor(private http: HttpClient) {}

  /**
   * Create a new changelog for the given learning object
   *
   * @param {string} learningObjectId the id of the learning object
   * @param {string} changelog the text body of the changelog
   * @returns {Promise<{}>}
   * @memberof ChangelogService
   */
  createChangelog(userId: string, learningObjectId: string, changelog: string): Promise<{}> {
    return this.http
      .post(ADMIN_ROUTES.CREATE_CHANGELOG(userId, learningObjectId), { changelogText: changelog }, { responseType: 'text' })
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
