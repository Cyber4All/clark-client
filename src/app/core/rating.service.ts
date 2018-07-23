import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { RATING_ROUTES } from '@env/route';
import { AuthService } from './auth.service';
import { User } from '../../../node_modules/@cyber4all/clark-entity';


@Injectable()
export class RatingService {

  constructor(private http: Http, private auth: AuthService) { }

  getRating() {
    const stubId = '5b495bd9a8aa78b0147718b9';
    return this.http
      .get(
        RATING_ROUTES.GET_RATING(stubId),
        {
          withCredentials: true
        }
      )
      .toPromise()
      .then(val => {
        console.log(val);
      });
  }

  createRating(newRating: {number: number, comment: string }, learningObjectName: string) {
    const username = this.auth.username;
    return this.http
      .post(
        RATING_ROUTES.CREATE_RATING(username, learningObjectName),
        newRating,
        {
          withCredentials: true
        }
      )
      .toPromise();
  }

  editRating(ratingId: string, learningObjectName: string, editRating: {number: number, comment: string}) {
    return this.http
      .patch(
        RATING_ROUTES.EDIT_RATING(ratingId, learningObjectName),
        editRating,
        {
          withCredentials: true
        }
      )
      .toPromise();
  }

  deleteRating(ratingId: string, learningObjectName: string) {
    return this.http
      .delete(
        RATING_ROUTES.DELETE_RATING(ratingId, learningObjectName),
        {
          withCredentials: true
        }
      )
      .toPromise();
  }

  getLearningObjectRatings(learningObjectName: string): Promise<any> {
    const username = this.auth.username;
    return this.http
      .get(
        RATING_ROUTES.GET_LEARNING_OBJECT_RATINGS(username, learningObjectName),
        {
          withCredentials: true
        }
      )
      .toPromise()
      .then(val => {
        return JSON.parse(val['_body']);
      });
  }

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
        console.log(val);
      });
  }
}
