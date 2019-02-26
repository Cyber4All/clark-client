import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { RATING_ROUTES } from '@env/route';
import { AuthService } from './auth.service';
import { throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';

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
    learningObjectId: string;
    ratingId: string;
    response: {comment: string}
  }): Promise<any> {
    const res = this.http.post(
      RATING_ROUTES.CREATE_RESPONSE({
        learningObjectId: params.learningObjectId,
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
    learningObjectId: string;
    ratingId: string;
    responseId: string;
    updates: {comment: string};
  }): Promise<any> {
    const res = this.http.patch(
      RATING_ROUTES.UPDATE_RESPONSE({
        learningObjectId: params.learningObjectId,
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
    learningObjectId: string;
    ratingId: string;
    responseId: string;
  }): Promise<any> {
    const res = this.http.delete(
      RATING_ROUTES.DELETE_RESPONSE({
        learningObjectId: params.learningObjectId,
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
    learningObjectId: string,
    rating: {value: number, comment: string };
  }) {
    return this.http
      .post(
        RATING_ROUTES.CREATE_RATING({
          learningObjectId: params.learningObjectId,
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
    learningObjectId: string;
    ratingId: string;
    rating: {value: number, comment: string};
  }) {
    return this.http
      .patch(
        RATING_ROUTES.EDIT_RATING({
          learningObjectId: params.learningObjectId,
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
   * @param {string} learningObjectId
   * @param {string} ratingId
   * @returns {Promise<any>}
   */
  deleteRating(params: {
    learningObjectId: string;
    ratingId: string;
  }) {
    return this.http
      .delete(
        RATING_ROUTES.DELETE_RATING({
          learningObjectId: params.learningObjectId,
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
   * @param {string} learningObjectId
   * @returns {Promise<any>}
   */
  getLearningObjectRatings(params: {
    learningObjectId: string;
  }): Promise<any> {
    return this.http
      .get(
        RATING_ROUTES.GET_LEARNING_OBJECT_RATINGS({
          learningObjectId: params.learningObjectId,
        }),
        {
          withCredentials: true
        }
      )
      .pipe(
        retry(3),
        catchError(this.handleError)
      )
      .toPromise()
      .then((res: any) => {
        const data = res;
        // assign id param to the value of _id and remove _id
        data.ratings = data.ratings.map(r => {
          const x = ({...r, id: r.id ? r.id : r._id });
          delete x._id;
          return x;
        });
        return data;
      });
  }

  /**
   * Flag a rating
   *
   * @param {string} learningObjectId
   * @param {string} ratingId
   * @param {{concern: string, comment: string}} report
   * @returns {Promise<any>}
   */
  flagLearningObjectRating(params: {
    learningObjectId: string;
    ratingId: string;
    report: {concern: string, comment?: string}
  }): Promise<any> {
    return this.http.post(
      RATING_ROUTES.FLAG_LEARNING_OBJECT_RATING({
        learningObjectId: params.learningObjectId,
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

  // TODO implement this
  getUserRatings() {
    const stubUsername = 'nvisal1';
    const stubLearningObjectName = 'testing contributors 3';
    return this.http
      .get(
        RATING_ROUTES.GET_USER_RATINGS(stubUsername),
        {
          withCredentials: true
        }
      )
      .pipe(
        retry(3),
        catchError(this.handleError)
      )
      .toPromise()
      .then(val => {
        // console.log(val);
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