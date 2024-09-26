import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { RELEVANCY_ROUTES } from './relevancy.routes';
import { AuthService } from '../../auth-module/auth.service';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { TOPICS_ROUTES } from '../topics/topics.routes';
@Injectable({
  providedIn: 'root'
})
export class RelevancyService {
  private headers = new HttpHeaders();

  constructor(private http: HttpClient, private auth: AuthService) {
    this.setHeaders();
  }

  /**
   * Sets the headers for the requests
   */
  setHeaders() {
    // reset headers with new users auth token
    this.headers = new HttpHeaders();
  }
  /**
   * Sets the nextCheck of a learning object
   *
   * @param learningObjectId learningObjectId
   * @param date The date that nextCheck needs to updated to
   */
  async setNextCheckDate(learningObjectId: string, date: Date): Promise<any> {
    return this.http
      .patch(RELEVANCY_ROUTES.UPDATE_RELEVANCY_CHECK_DATE(learningObjectId),
        { date },
        {
          headers: this.headers,
          withCredentials: true,
          responseType: 'text',
        }
      )
      .pipe(

        catchError(this.handleError)
      )
      .toPromise();
  }

  /**
   * Assigns multiple users to evaluate multiple learning objects
   *
   * @param args.cuids are the learning object cuids that are going to be assigned wtih evaluators
   * @param args.assignerIds are the evaluators that are going to be assigned to each of the learning objects
   */
  async assignEvaluators(args: {
    cuids: string[],
    assignerIds: string[]
  }): Promise<any> {
    return this.http
      .post(RELEVANCY_ROUTES.ADD_EVALUATOR(),
        args,
        {
          headers: this.headers,
          withCredentials: true,
          responseType: 'text',
        }
      )
      .pipe(

        catchError(this.handleError)
      )
      .toPromise();
  }

  async removeEvaluators(args: {
    cuids: string[],
    assignerIds: string[]
  }): Promise<any> {
    return this.http
      .patch(RELEVANCY_ROUTES.UPDATE_EVALUATORS(),
        args,
        {
          headers: this.headers,
          withCredentials: true,
          responseType: 'text',
        }
      )
      .pipe(

        catchError(this.handleError)
      )
      .toPromise();
  }

  /**
   *  Function to update the learning object with new outcome mappings
   *
   * @param objectId learning objectId
   * @param outcomeId outcomeId on learning object
   * @param guidelineIds id of mapped guidelines
   */
  async updateLearningOutcomeMappings(objectId: string, outcomeId: string, guidelineIds: string[]): Promise<void> {
    return await new Promise((resolve, reject) => {
      this.http
        .patch(RELEVANCY_ROUTES.UPDATE_MAPPING(objectId, outcomeId),
          { guidelines: guidelineIds },
          {
            headers: this.headers,
            withCredentials: true,
            responseType: 'text',
          }
        )
        .pipe(

          catchError(this.handleError)
        )
        .toPromise()
        .then(
          (res: any) => resolve(res),
          (err) => reject(err),
        );
    });
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
