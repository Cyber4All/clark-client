import { PUBLIC_LEARNING_OBJECT_ROUTES, USER_ROUTES } from '@env/route';
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import { LearningObject } from '@entity';
import { Query } from '../interfaces/query';

import * as querystring from 'querystring';

// TODO: move to core module
@Injectable()
export class LearningObjectService {
  filteredResults;
  dataObserver;
  data;

  constructor(
    private http: HttpClient,
    private headers: HttpHeaders = new HttpHeaders(),
    ) {
      this.headers.append('Content-Type', 'application/json');
    }

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
  getLearningObjects(query?: Query): Promise<{learningObjects: LearningObject[], total: number}> {
    let route = '';
    if (query) {
      const queryClone = Object.assign({}, query);
      if (
        queryClone.standardOutcomes &&
        queryClone.standardOutcomes.length &&
        typeof queryClone.standardOutcomes[0] !== 'string'
      ) {
        queryClone.standardOutcomes = (<string[]>(
          queryClone.standardOutcomes
        )).map(o => o['id']);
      }
      const queryString = querystring.stringify(queryClone);
      route = PUBLIC_LEARNING_OBJECT_ROUTES.GET_PUBLIC_LEARNING_OBJECTS_WITH_FILTER(
        queryString
      );
    } else {
      route = PUBLIC_LEARNING_OBJECT_ROUTES.GET_PUBLIC_LEARNING_OBJECTS;
    }

    return this.http
      .get(route)
      .pipe(
        retry(3),
        catchError(this.handleError)
      )
      .toPromise()
      .then((response: any) => {
        const objects = response.objects;
        return { learningObjects: objects.map(object => new LearningObject(object)), total: response.total};
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
    author: string,
    learningObjectName: string,
  ): Promise<LearningObject> {
    const route = PUBLIC_LEARNING_OBJECT_ROUTES.GET_PUBLIC_LEARNING_OBJECT(
      author,
      learningObjectName
    );
    return this.http
      .get(route)
      .pipe(
        retry(3),
        catchError(this.handleError)
      )
      .toPromise()
      .then((res: any) => {
        const learningObject = new LearningObject(res);
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
  getRevisedLearningObject(
    learningObjectId: String
  ): Promise<LearningObject> {
    const route = USER_ROUTES.GET_LEARNING_OBJECT(
     learningObjectId
    );
    return this.http
      .get(route)
      .pipe(
        retry(3),
        catchError(this.handleError)
      )
      .toPromise()
      .then((res: any) => {
        const learningObject = new LearningObject(res);
        return learningObject;
      });
  }
  getUsersLearningObjects(username: string): Promise<LearningObject[]> {
    const route = USER_ROUTES.LOAD_USER_PROFILE(
      username
    );

    return this.http
      .get(route, { withCredentials: true })
      .pipe(
        retry(3),
        catchError(this.handleError)
      )
      .toPromise()
      .then((val: any) => {
        return val
          .map(l => new LearningObject(l));
      });
  }

  // Editor Actions
  createRevision(object: LearningObject): Promise<object> {
    const route = USER_ROUTES.CREATE_REVISION_OF_LEARNING_OBJECT(object.author.username, object.id);
    return this.http
    .post(
      route,
      { object: object },
      { headers: this.headers, withCredentials: true }
    )
    .pipe(
      retry(3),
      catchError(this.handleError)
    )
    .toPromise().then(response => {
      console.log(response);
      return response;
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
