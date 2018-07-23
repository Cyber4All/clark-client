import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { RATING_ROUTES } from '@env/route';
import { AuthService } from './auth.service';
import { User } from '../../../node_modules/@cyber4all/clark-entity';


@Injectable()
export class RatingService {

  constructor(private http: Http, private auth: AuthService) { }

  createRating(learningObjectAuthor: string, learningObjectName: string, newRating: {number: number, comment: string }) {
    return this.http
      .post(
        RATING_ROUTES.CREATE_RATING(learningObjectAuthor, learningObjectName),
        newRating,
        {
          withCredentials: true
        }
      )
      .toPromise();
  }

  editRating(learningObjectAuthor: string, learningObjectName: string, ratingId: string, rating: {number: number, comment: string}) {
    return this.http
      .patch(
        RATING_ROUTES.EDIT_RATING(learningObjectAuthor, learningObjectName, ratingId),
        rating,
        {
          withCredentials: true
        }
      )
      .toPromise();
  }

  deleteRating(learningObjectAuthor: string, learningObjectName: string, ratingId: string) {
    return this.http
      .delete(
        RATING_ROUTES.DELETE_RATING(learningObjectAuthor, learningObjectName, ratingId),
        {
          withCredentials: true
        }
      )
      .toPromise();
  }

  getLearningObjectRatings(learningObjectAuthor: string, learningObjectName: string): Promise<any> {
    return this.http
      .get(
        RATING_ROUTES.GET_LEARNING_OBJECT_RATINGS(learningObjectAuthor, learningObjectName),
        {
          withCredentials: true
        }
      )
      .toPromise()
      .then(val => {
        return JSON.parse(val['_body']);
      });
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
      .toPromise()
      .then(val => {
        // console.log(val);
      });
  }
}
