import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { EDITORIAL_ROUTES } from './editorial.routes';
import { LearningObject } from '@entity';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class EditorialService {
  httpHeaders = new HttpHeaders();

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {}

  /**
   * Creates a Revision of an existing learning object
   *
   * @param cuid the CUID of the learning object to create a revision of
   */
  async createRevision(cuid: string): Promise<any> {
    const route = EDITORIAL_ROUTES.CREATE_REVISION(cuid);
    const response = await this.http
      .post(route, {}, { headers: this.httpHeaders, withCredentials: true })
      .pipe(catchError(this.handleError))
      .toPromise();
    return response;
  }

  /**
   * Deletes a revision of a learning object. This is designed to allow an editor to create a new
   * revision when it is necessary for the editorial process to continue.
   *
   * @param cuid cuid of the learning object
   * @returns
   */
  deleteRevision(cuid: string, version: number) {
    return this.http
      .delete(EDITORIAL_ROUTES.DELETE_REVISION(cuid, version), {
        withCredentials: true,
        responseType: 'text',
      })
      .pipe(catchError(this.handleError))
      .toPromise();
  }

  /**
   * Navigate to the learning object editor.
   * @param learningObject Learning Object
   * @param revisedLearningObject Revised Learning Object
   */
  navigateToEditor(learningObject: LearningObject) {
    this.router.navigate([
      'onion',
      'learning-object-builder',
      learningObject.cuid,
      learningObject.version,
    ]);
  }

  // TODO: clean up these checks for better readability

  /**
   * Checks if an editor is NOT permitted to create a revision or make edits.
   * @param learningObject Learning Object
   * @param revisedLearningObjects Revised Learning Object
   * @returns {boolean}
   */
  isNotPermittedToMakeChanges(
    learningObject: LearningObject,
    revisedLearningObject: LearningObject,
  ) {
    return (
      (learningObject.status === 'released' &&
        revisedLearningObject &&
        (revisedLearningObject.status === 'unreleased' ||
          revisedLearningObject.status === 'rejected')) ||
      learningObject.status === 'rejected'
    );
  }

  /**
   * Checks if an editor is permitted to make edits to a waiting, review, or proofing Learning Object
   * @param learningObject Learning Object
   * @param revisedLearningObject Revised Learning Object
   * @returns {boolean}
   */
  canMakeEdits(
    learningObject: LearningObject,
    revisedLearningObject: LearningObject,
  ) {
    return (
      learningObject.status === 'waiting' ||
      (revisedLearningObject && revisedLearningObject.status === 'waiting') ||
      learningObject.status === 'review' ||
      (revisedLearningObject && revisedLearningObject.status === 'review') ||
      learningObject.status === 'proofing' ||
      (revisedLearningObject && revisedLearningObject.status === 'proofing') ||
      learningObject.status === 'unreleased' ||
      (revisedLearningObject && revisedLearningObject.status === 'unreleased')
    );
  }

  /**
   * Checks if a learning object can have a new revision made to itself.
   * @param learningObject Learning Object
   * @param revisedLearningObject Revised Learning Object
   * @returns {boolean}
   */
  canCreateRevision(
    learningObject: LearningObject,
    revisedLearningObject: LearningObject,
  ) {
    return learningObject.status === 'released' && !revisedLearningObject;
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
