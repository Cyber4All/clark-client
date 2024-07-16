import {
  LEGACY_PUBLIC_LEARNING_OBJECT_ROUTES,
  LEGACY_USER_ROUTES,
} from '../core/learning-object-module/learning-object/learning-object.routes';
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { LearningObject } from '@entity';
import { Query } from '../interfaces/query';

import * as querystring from 'querystring';
import { USER_ROUTE } from '../core/user-module/user.routes';
import { REVISION_ROUTES } from '../core/learning-object-module/revisions/revisions.routes';
import { SEARCH_ROUTES } from 'app/core/learning-object-module/search/search.routes';

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
      const queryString = querystring.stringify(queryClone);
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
   * Fetches LearningObject by id
   *
   * @param {string} id
   * @returns {Promise<LearningObject>}
   * @memberof LearningObjectService
   */
  getLearningObject(
    cuid: string,
    version?: number,
  ): Promise<LearningObject> {
    const route = LEGACY_PUBLIC_LEARNING_OBJECT_ROUTES.GET_PUBLIC_LEARNING_OBJECT(
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
  /**
   * Fetches LearningObject by id
   *
   * @param {string} id
   * @returns {Promise<LearningObject>}
   * @memberof LearningObjectService
   */
  getRevisedLearningObject(learningObjectId: String): Promise<LearningObject> {
    const route = LEGACY_USER_ROUTES.GET_LEARNING_OBJECT(learningObjectId);
    return this.http
      .get(route)
      .pipe(catchError(this.handleError))
      .toPromise()
      .then((res: any) => {
        const learningObject = new LearningObject(res);
        return learningObject;
      });
  }
  getUsersLearningObjects(username: string): Promise<LearningObject[]> {
    return this.http
      .get(USER_ROUTE.GET_USER_PROFILE(username), { withCredentials: true })
      .pipe(catchError(this.handleError))
      .toPromise()
      .then((val: any) => {
        return val.map((l) => new LearningObject(l));
      });
  }

  /**
   * Creates a Revision of an existing learning object
   *
   * @param cuid the CUID of the learning object to create a revision of
   */
  async createRevision(cuid: string): Promise<any> {
    const route = REVISION_ROUTES.CREATE_REVISION(cuid);
    const response = await this.http
      .post(route, {}, { withCredentials: true })
      .pipe(catchError(this.handleError))
      .toPromise();
    return response;
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
