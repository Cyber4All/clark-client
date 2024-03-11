import { Injectable } from '@angular/core';
import { SUBMISSION_ROUTES } from './submissions.routes';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class SubmissionsService {

  constructor(private http: HttpClient) { }

   /**
    * Adds specified learning object to specified collection
    *
    * @param {string} learningObjectId id of learning object to be added to collection
    * @param {string} collectionName name of collection in which to insert learning object
    * @param {string} [submissionReason] reason for submitting a learning object to a collection
    * @param {string[]} [selectedAuthorizations] authorizations that the author gave for changes
    * @return {Promise<any>}
    */
   submit(params: {
    userId: string,
    learningObjectId: string,
    collectionName: string,
    submissionReason?: string,
    selectedAuthorizations?: string[],
  }): Promise<any> {
    return this.http
      .post(
        SUBMISSION_ROUTES.SUBMIT_LEARNING_OBJECT({
          userId: params.userId,
          learningObjectId: params.learningObjectId,
        }),
        {
          collection: params.collectionName,
          submissionReason: params.submissionReason,
          selectedAuthorizations: params.selectedAuthorizations
        },
        { withCredentials: true, responseType: 'text' }
      )
      .pipe(

        catchError(this.handleError)
      )
      .toPromise();
  }

  unsubmit(params: {
    learningObjectId: string,
    userId: string,
  }): Promise<any> {
    return this.http
      .delete(
        SUBMISSION_ROUTES.DELETE_SUBMISSION({
          userId: params.userId,
          learningObjectId: params.learningObjectId,
        }),
        { withCredentials: true, responseType: 'text' }
      )
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
