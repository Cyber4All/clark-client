import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RATING_ROUTES } from '@env/route';
import { AuthService } from './auth.service';


@Injectable()
export class RatingService {

  constructor(private http: HttpClient, private auth: AuthService) { }

  createResponse(params: {
    learningObjectId: string;
    ratingId: string;
    response: {comment: string}
  }): Promise<any> {
    return this.http.post(
      RATING_ROUTES.CREATE_RESPONSE({
        learningObjectId: params.learningObjectId,
        ratingId: params.ratingId,
      }),
      params.response,
      { withCredentials: true },
    ).toPromise();
  }

  editResponse(params: {
    learningObjectId: string;
    ratingId: string;
    responseId: string;
    updates: {comment: string};
  }): Promise<any> {
    return this.http.patch(
      RATING_ROUTES.UPDATE_RESPONSE({
        learningObjectId: params.learningObjectId,
        ratingId: params.ratingId,
        responseId: params.responseId,
      }),
      params.updates,
      { withCredentials: true },
    ).toPromise();
  }

  deleteResponse(params: {
    learningObjectId: string;
    ratingId: string;
    responseId: string;
  }): Promise<any> {
    return this.http.delete(
      RATING_ROUTES.DELETE_RESPONSE({
        learningObjectId: params.learningObjectId,
        ratingId: params.ratingId,
        responseId: params.responseId,
      }),
      { withCredentials: true },
    ).toPromise();
  }

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
      .toPromise();
  }

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
      .toPromise();
  }

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
      .toPromise();
  }


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
      ).toPromise();
    }
  }


