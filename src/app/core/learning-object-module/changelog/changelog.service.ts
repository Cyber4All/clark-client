import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { CHANGELOG_ROUTES } from './changelog.routes';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { AuthService } from 'app/core/auth-module/auth.service';

@Injectable({
  providedIn: 'root'
})
export class ChangelogService {

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  /**
   * Create a new changelog for the given learning object
   *
   * @param {string} learningObjectId the id of the learning object
   * @param {string} changelog the text body of the changelog
   * @returns {Promise<{}>}
   * @memberof ChangelogService
   */
  createChangelog(learningObjectCuid: string, changelog: string): Promise<{}> {
    const changelogEntries = [{
      authorId: this.authService.user.id,
      date: new Date(),
      text: changelog
    }];
    return this.http
      .post(CHANGELOG_ROUTES.CREATE_CHANGELOG(learningObjectCuid), {changelogEntries: changelogEntries}, { responseType: 'text' })
      .pipe(
        catchError(this.handleError)
      )
      .toPromise();
  }

  /**
   * Gets all change logs for a given Learning Object
   *
   * @param {string} userId the id of the Learning Object author
   * @param {string} learningObjectId the id of the Learning Object
   * @returns {Promise<{}>}
   * @memberof ChangelogService
   */
  getAllChangelogs(
    learningObjectCuid: string,
    minusRevision?: boolean,
    recent?: boolean
  ): Promise<any> {
    return this.http
      .get(CHANGELOG_ROUTES.GET_CHANGELOGS(
        learningObjectCuid,
        minusRevision,
        recent
      ))
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
