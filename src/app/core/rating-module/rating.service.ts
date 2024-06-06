import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { RATING_ROUTES } from './rating.routes';
import { AuthService } from '../auth-module/auth.service';
import { throwError } from 'rxjs';
import { catchError, map, filter } from 'rxjs/operators';

export interface LearningObjectRatings {
  _id?: any;
  avgValue: number;
  ratings: Rating[];
}

export interface Rating {
  _id?: any;
  value: number;
  comment: string;
  user: {
      name: string;
      username: string;
      email: string;
  };
  source: {
      cuid: string;
      version: number;
  };
  date: number;
}

@Injectable({
  providedIn: 'root'
})
export class RatingService {

  constructor(private http: HttpClient, private auth: AuthService) { }

  /**
   * Respond to a rating
   *
   * @param {string} ratingId
   * @param {{comment:string}} response
   * @returns {Promise<any>}
   */
  createResponse(params: {
    ratingId: string;
    response: { comment: string }
  }): Promise<any> {
    const res = this.http.post(
      RATING_ROUTES.CREATE_RESPONSE(params.ratingId),
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
   * @param {string} responseId
   * @param {{comment: string}} updates
   * @returns {Promise<any>}
   */
  editResponse(params: {
    responseId: string;
    updates: { comment: string };
  }): Promise<any> {
    const res = this.http.patch(
      RATING_ROUTES.UPDATE_RESPONSE(params.responseId),
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
   * @param {string} responseId
   * @returns {Promise<any>}
   */
  deleteResponse(params: {
    responseId: string;
  }): Promise<any> {
    const res = this.http.delete(
      RATING_ROUTES.DELETE_RESPONSE(params.responseId),
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
   * @param {{value: number, comment: string}} rating
   * @returns {Promise<any>}
   */
  createRating(params: {
    CUID: string;
    version: number;
    rating: { value: number, comment: string };
  }) {
    return this.http
      .post(
        RATING_ROUTES.CREATE_RATING(
          params.CUID,
          params.version,),
        params.rating,
        {
          withCredentials: true, responseType: 'text'
        }
      )
      .pipe(
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
    CUID: string;
    version: number;
    ratingId: string;
    rating: { value: number, comment: string };
  }) {
    return this.http
      .patch(
        RATING_ROUTES.EDIT_RATING(
          params.CUID,
          params.version,
          params.ratingId,
        ),
        params.rating,
        {
          withCredentials: true, responseType: 'text'
        }
      )
      .pipe(
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
    CUID: string;
    version: number;
    ratingId: string;
  }) {
    return this.http
      .delete(
        RATING_ROUTES.DELETE_RATING(
          params.CUID,
          params.version,
          params.ratingId,
        ),
        {
          withCredentials: true, responseType: 'text'
        }
      )
      .pipe(

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
  getLearningObjectRatings(
    cuid: string,
    version: number,
  ): Promise<LearningObjectRatings> {
    return this.http
      .get(
        RATING_ROUTES.GET_LEARNING_OBJECT_RATINGS(
          cuid,
          version,
        ),
        {
          withCredentials: true
        }
      )
      .pipe(
        catchError(this.handleError),
        filter(rating => rating != null)
      )
      .toPromise()
      .then((learningObjectRatings: LearningObjectRatings) => {
        if (learningObjectRatings.ratings) {
          const ratings = learningObjectRatings.ratings.map((rating: Rating) => {
            // Map the _id to id
            const mappedRating = ({ ...rating, id: rating._id});
            delete mappedRating._id;

            return mappedRating;
          });
          return { avgValue: learningObjectRatings.avgValue, ratings };
        } else {
          console.log('FIX ME: No ratings found for learning object');
        }
      });
  }

  /**
   * Flag a rating
   *
   * @param {string} ratingId
   * @param {{concern: string, comment: string}} report
   * @returns {Promise<any>}
   */
  flagLearningObjectRating(params: {
    ratingId: string;
    report: { concern: string, comment?: string }
  }): Promise<any> {
    return this.http.post(
      RATING_ROUTES.FLAG_LEARNING_OBJECT_RATING(
        params.ratingId,
      ),
      params.report,
      { withCredentials: true },
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
