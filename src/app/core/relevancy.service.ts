import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { RELEVANCY_ROUTES } from '@env/route';
import { AuthService } from './auth.service';
import { catchError, retry } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Topic } from '@entity';
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
   * @param username Username of the author
   * @param learningObjectId learningObjectId
   * @param date The date that nextCheck needs to updated to
   */
  async setNextCheckDate(username: string, learningObjectId: string, date: Date): Promise<any> {
    return this.http
      .patch(RELEVANCY_ROUTES.NEXT_CHECK(username, learningObjectId),
        { date },
        {
          headers: this.headers,
          withCredentials: true,
          responseType: 'text',
        }
      )
      .pipe(
        retry(3),
        catchError(this.handleError)
      )
      .toPromise();
  }

  /**
   * This gets the list of object topics from the backend to display
   *
   * @returns A list of topics
   */
  async getTopics(): Promise<Topic[]> {
    return await new Promise((resolve, reject) => {
      this.http
        .get<Topic[]>(RELEVANCY_ROUTES.GET_TOPICS(),
          {
            headers: this.headers,
            withCredentials: true,
          }
        )
        .pipe(
          retry(3),
          catchError(this.handleError)
        )
        .toPromise()
        .then(
          (res: any) => {
            resolve(res);
          },
          (err) => {
            reject(err);
          }
        );
    });
  }

  async updateObjectTopics(username: string, id: string, topicIds: string[]): Promise<void> {
    return await new Promise((resolve, reject) => {
      this.http
        .patch(RELEVANCY_ROUTES.PATCH_OBJECT_TOPICS(username, id),
          { topicIds },
          {
            headers: this.headers,
            withCredentials: true,
            responseType: 'text',
          }
        )
        .pipe(
          retry(3),
          catchError(this.handleError)
        )
        .toPromise()
        .then(
          (res: any) => resolve(res),
          (err) => reject(err),
        );
    });
  }

  async updateLearningOutcomeMappings(username: string, objectId: string, outcomeId: string, guidelineIds: string[]): Promise<void> {
    return await new Promise((resolve, reject) => {
      this.http
        .patch(RELEVANCY_ROUTES.PATCH_OBJECT_OUTCOME_MAPPINGS(username, objectId, outcomeId),
          { guidelines: guidelineIds },
          {
            headers: this.headers,
            withCredentials: true,
            responseType: 'text',
          }
        )
        .pipe(
          retry(3),
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
