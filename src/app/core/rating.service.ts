import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RATING_ROUTES } from '@env/route';
import { AuthService } from './auth.service';


@Injectable()
export class RatingService {

  constructor(private http: HttpClient, private auth: AuthService) { }

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

  flagLearningObjectRating(
    learningObjectAuthor: string,
    learningObjectName: string,
    ratingId: string,
    report: {concern: string, comment?: string}): Promise<any> {
    return this.http.post(
      RATING_ROUTES.FLAG_LEARNING_OBJECT_RATING(learningObjectAuthor, learningObjectName, ratingId),
      report,
      { withCredentials: true }
    ).toPromise();
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
