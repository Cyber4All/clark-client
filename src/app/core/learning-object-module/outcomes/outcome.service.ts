import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LearningOutcome } from 'entity/learning-outcome/learning-outcome';
import { OUTCOME_ROUTES } from './outcome.routes';
import { CookieService } from 'ngx-cookie-service';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OutcomeService {
  private headers: HttpHeaders = new HttpHeaders();

  constructor(
    private http: HttpClient,
    private cookies: CookieService,
  ) {}

  /**
   * Create an outcome for a source learning object
   *
   * @param {LearningObject} source the learningObject
   * @param {LearningOutcome} outcome
   * @param username The username of the learning object author
   * @memberof LearningObjectService
   */
  addLearningOutcome(sourceId: string, outcome: LearningOutcome): Promise<any> {
    return this.http
      .post(
        OUTCOME_ROUTES.CREATE_OUTCOME(sourceId),
        outcome,
        {
          headers: this.headers,
          withCredentials: true,
          responseType: 'text'
        }
      )
      .pipe(
        catchError(this.handleError)
      )
      .toPromise();
  }

  /**
   * Modify an outcome by sending a partial learning outcome
   *
   * @param {{ id: string, [key: string]: any }} outcome the properties of the outcome to change
   * @returns {Promise<any>}
   * @memberof LearningObjectService
   */
  saveOutcome(
    outcome: { id: string;[key: string]: any }
  ): Promise<any> {
    const outcomeId = outcome.id;
    delete outcome.id;

    return this.http
      .patch(
        OUTCOME_ROUTES.UPDATE_OUTCOME(outcomeId),
        { ...outcome },
        { headers: this.headers, withCredentials: true },
      )
      .pipe(

        catchError(this.handleError)
      )
      .toPromise();
  }

  /**
   * Deletes an outcome on a given learning object
   *
   * @param outcomeId The outcome Id
   */
    deleteOutcome(outcomeId: string): Promise<any> {
      return this.http
        .delete(OUTCOME_ROUTES.DELETE_OUTCOME(outcomeId), { headers: this.headers, withCredentials: true })
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
