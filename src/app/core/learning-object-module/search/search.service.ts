import { Injectable } from '@angular/core';
import { SEARCH_ROUTES } from './search.routes';
import { catchError } from 'rxjs/operators';
import { LearningObject } from '@entity';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import { Query } from 'app/interfaces/query';

@Injectable({
  providedIn: 'root'
})
export class SearchService {

  constructor(
    private http: HttpClient
  ) { }

  /**
   * Fetches Array of Learning Objects
   *
   * @returns {Promise<LearningObject[]>}
   * @memberof LearningObjectService
   */
  // TODO: This needs to be moved to the search service
  getLearningObjects(
    query?: Query,
  ): Promise<{ learningObjects: LearningObject[]; total: number }> {
    let route = '';
    if (query) {
      const queryClone = Object.assign({}, query);
      if (
        queryClone.standardOutcomes &&
        queryClone.standardOutcomes.length &&
        typeof queryClone.standardOutcomes[0] !== 'string'
      ) {
        queryClone.standardOutcomes = (
          queryClone.standardOutcomes as string[]
        ).map((o) => o['id']);
      }
      const queryString = new URLSearchParams(queryClone).toString();
      route =
        SEARCH_ROUTES.SEARCH_LEARNING_OBJECTS(queryString);
    } else {
      route = SEARCH_ROUTES.SEARCH_LEARNING_OBJECTS();
    }

    return this.http
      .get(route)
      .pipe(catchError(this.handleError))
      .toPromise()
      .then((response: any) => {
        const objects = response.objects;
        return {
          learningObjects: objects.map((object) => new LearningObject(object)),
          total: response.total,
        };
      });
  }

  // TODO: This needs to be moved to the search service
  getUsersLearningObjects(username: string, query?: any): Promise<LearningObject[]> {
    return this.http
      .get(SEARCH_ROUTES.GET_USERS_LEARNING_OBJECTS(username, new URLSearchParams(query).toString()), { withCredentials: true })
      .pipe(catchError(this.handleError))
      .toPromise()
      .then((val: any) => {
        return val.map((l) => new LearningObject(l));
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
