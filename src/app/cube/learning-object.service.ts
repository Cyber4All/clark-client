import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LearningObject } from '@entity';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { LEARNING_OBJECT_ROUTES } from '../core/learning-object-module/learning-object/learning-object.routes';
import { Query } from '../interfaces/query';

import { SEARCH_ROUTES } from 'app/core/learning-object-module/search/search.routes';
import { USER_ROUTES } from '../core/user-module/user.routes';

// TODO: move to core module
@Injectable({
  providedIn: 'root',
})
export class LearningObjectService {
  filteredResults;
  dataObserver;
  data;

  constructor(private http: HttpClient) {}

  observeFiltered(): Observable<LearningObject[]> {
    return this.data;
  }

  getFilteredObjects() {
    return this.filteredResults;
  }

  clearSearch() {
    this.filteredResults = [];
  }

  openLearningObject(url: string) {
    window.open(url);
  }
  /**
   * Fetches Array of Learning Objects
   *
   * @returns {Promise<LearningObject[]>}
   * @memberof LearningObjectService
   */
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
        SEARCH_ROUTES.GET_PUBLIC_LEARNING_OBJECTS_WITH_FILTER(queryString);
    } else {
      route = SEARCH_ROUTES.GET_PUBLIC_LEARNING_OBJECTS;
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

  /**
   * Fetches LearningObject by cuid
   *
   * @param {string} cuid
   * @returns {Promise<LearningObject>}
   * @memberof LearningObjectService
   */
  getLearningObject(
    cuid: string,
    version?: number,
  ): Promise<LearningObject> {
    const route = LEARNING_OBJECT_ROUTES.GET_PUBLIC_LEARNING_OBJECT(
      cuid,
      version
    );

    return this.http
      .get(route)
      .pipe(catchError(this.handleError))
      .toPromise()
      .then((res: any) => {
        const learningObject = new LearningObject(res[0]);
        return learningObject;
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
