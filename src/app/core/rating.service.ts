import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { RATING_ROUTES } from '@env/route';
import { AuthService } from './auth.service';
import { throwError } from 'rxjs';
import { retry, catchError, map, filter } from 'rxjs/operators';

@Injectable()
export class RatingService {

  constructor(private http: HttpClient, private auth: AuthService) { }

  /**
   * Respond to a rating
   *
   * @param {string} learningObjectId
   * @param {string} ratingId
   * @param {{comment:string}} response
   * @returns {Promise<any>}
   */
  createResponse(params: {
    username: string;
    CUID: string;
    version: number;
    ratingId: string;
    response: { comment: string }
  }): Promise<any> {
    const res = this.http.post(
      RATING_ROUTES.CREATE_RESPONSE({
        username: params.username,
        CUID: params.CUID,
        version: params.version,
        ratingId: params.ratingId,
      }),
      params.response,
      { withCredentials: true },
    ).toPromise()
      .catch(result => {
        return Promise.resolve(result.status === 200);
      });
    return res;
  }


  /**
   * Edit a response
   *
   * @param {string} learningObjectId
   * @param {string} ratingId
   * @param {string} responseId
   * @param {{comment: string}} updates
   * @returns {Promise<any>}
   */
  editResponse(params: {
    username: string;
    CUID: string;
    version: number;
    ratingId: string;
    responseId: string;
    updates: { comment: string };
  }): Promise<any> {
    const res = this.http.patch(
      RATING_ROUTES.UPDATE_RESPONSE({
        username: params.username,
        CUID: params.CUID,
        version: params.version,
        ratingId: params.ratingId,
        responseId: params.responseId,
      }),
      params.updates,
      { withCredentials: true },
    ).toPromise()
      .catch(result => {
        return Promise.resolve(result.status === 200);
      });
    return res;
  }

  /**
   * Delete a response
   *
   * @param {string} learningObjectId
   * @param {string} ratingId
   * @param {string} responseId
   * @returns {Promise<any>}
   */
  deleteResponse(params: {
    username: string;
    CUID: string;
    version: number;
    ratingId: string;
    responseId: string;
  }): Promise<any> {
    const res = this.http.delete(
      RATING_ROUTES.DELETE_RESPONSE({
        username: params.username,
        CUID: params.CUID,
        version: params.version,
        ratingId: params.ratingId,
        responseId: params.responseId,
      }),
      { withCredentials: true },
    ).toPromise()
      .catch(result => {
        return Promise.resolve(result.status === 200);
      });
    return res;
  }

  /**
   * Create a rating for a learning object
   *
   * @param {string} learningObjectId
   * @param {{value: number, comment: string}} rating
   * @returns {Promise<any>}
   */
  createRating(params: {
    username: string;
    CUID: string;
    version: number;
    rating: { value: number, comment: string };
  }) {
    return this.http
      .post(
        RATING_ROUTES.CREATE_RATING({
          username: params.username,
          CUID: params.CUID,
          version: params.version,
        }),
        params.rating,
        {
          withCredentials: true, responseType: 'text'
        }
      )
      .pipe(
        retry(3),
        catchError(this.handleError)
      )
      .toPromise();
  }

  /**
   * Edit a rating
   *
   * @param {string} learningObjectId
   * @param {string} ratingId
   * @param {{value: number, comment: string}} rating
   * @returns {Promise<any>}
   */
  editRating(params: {
    username: string;
    CUID: string;
    version: number;
    ratingId: string;
    rating: { value: number, comment: string };
  }) {
    return this.http
      .patch(
        RATING_ROUTES.EDIT_RATING({
          username: params.username,
          CUID: params.CUID,
          version: params.version,
          ratingId: params.ratingId,
        }),
        params.rating,
        {
          withCredentials: true, responseType: 'text'
        }
      )
      .pipe(
        retry(3),
        catchError(this.handleError)
      )
      .toPromise();
  }


  /**
   * Delete a rating
   *
   * @param {string} CUID
   * @param {string} version
   * @param {string} ratingId
   * @returns {Promise<any>}
   */
  deleteRating(params: {
    username: string;
    CUID: string;
    version: number;
    ratingId: string;
  }) {
    return this.http
      .delete(
        RATING_ROUTES.DELETE_RATING({
          username: params.username,
          CUID: params.CUID,
          version: params.version,
          ratingId: params.ratingId,
        }),
        {
          withCredentials: true, responseType: 'text'
        }
      )
      .pipe(
        retry(3),
        catchError(this.handleError)
      )
      .toPromise();
  }


  /**
   * Get ratings for a learning object
   *
   * @param {string} CUID
   * @param {string} version
   * @returns {Promise<any>}
   */
  getLearningObjectRatings(params: {
    username: string;
    CUID: string;
    version: number;
  }): Promise<any> {
    return this.http
      .get(
        RATING_ROUTES.GET_LEARNING_OBJECT_RATINGS({
          username: params.username,
          CUID: params.CUID,
          version: params.version,
        }),
        {
          withCredentials: true
        }
      )
      .pipe(
        retry(3),
        catchError(this.handleError),
        filter(response => response != null),
        map((response: any) => {
          const ratings = response.ratings.map((r: any) => {
            const x = ({ ...r, id: r.id ? r.id : r._id });
            delete x._id;
            return x;
          });
          return { ...response, ratings };
        })
      )
      .toPromise();
  }

  /**
   * Flag a rating
   *
   * @param {string} CUID
   * @param {string} version
   * @param {string} ratingId
   * @param {{concern: string, comment: string}} report
   * @returns {Promise<any>}
   */
  flagLearningObjectRating(params: {
    username: string;
    CUID: string;
    version: number;
    ratingId: string;
    report: { concern: string, comment?: string }
  }): Promise<any> {
    return this.http.post(
      RATING_ROUTES.FLAG_LEARNING_OBJECT_RATING({
        username: params.username,
        CUID: params.CUID,
        version: params.version,
        ratingId: params.ratingId,
      }),
      params.report,
      { withCredentials: true },
    )
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
