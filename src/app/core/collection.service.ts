import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { USER_ROUTES, PUBLIC_LEARNING_OBJECT_ROUTES, COLLECTIONS_ROUTES } from '../../environments/route';
import { BehaviorSubject, throwError } from 'rxjs';
import { catchError, retry, skipWhile } from 'rxjs/operators';

import { Query } from '../interfaces/query';
import { LearningObject } from '../../entity/learning-object/learning-object';
import * as querystring from 'querystring';

export interface Collection {
  name: string;
  abvName: string;
  hasLogo: boolean;
}

@Injectable()
export class CollectionService {
  private collections: Collection[];
  private loading$ = new BehaviorSubject<boolean>(true);
  darkMode502 = new BehaviorSubject<boolean>(true);
  constructor(private http: HttpClient) {
    this.fetchCollections()
      .catch(e => {
        throw e;
      });
  }

  /**
   * Fetches the list of collections from the API
   */
  async fetchCollections() {
    this.collections = await this.http.get(PUBLIC_LEARNING_OBJECT_ROUTES.GET_COLLECTIONS, { withCredentials: true })
      .pipe(
        retry(3),
        catchError(this.handleError)
      )
      .toPromise()
      .then(async (collections: Collection[]) => {
        for (const c of collections) {
          c.hasLogo = false;

          try {
            await this.http.head('/assets/images/collections/' + c.abvName + '.png').pipe(
              catchError(this.handleError)
            ).toPromise().then(() => {
              c.hasLogo = true;
            });
          } catch (_) {
            // the image doesn't exist, we don't need to do anything here since this is an expected error in many cases
          }
        }
        return collections;
      });
    this.loading$.next(false);
  }

  /**
   * Retrieve a list of collections
   *
   * @return {Collection[]} list of collections
   */
  async getCollections(): Promise<Collection[]> {
    if (this.loading$.value) {
      // If the service is loading collections, create a promise that will
      // resolve the collections once the value of loading is false
      const p = new Promise<Collection[]>(resolve => {
        this.loading$
          .pipe(
            skipWhile(val => val === true)
          )
          .subscribe(val => {
            resolve(this.collections);
          });
      });
      return await p;
    } else {
      return this.collections;
    }
  }

  /**
   * Adds specified learning object to specified collection
   *
   * @param {string} learningObjectId id of learning object to be added to collection
   * @param {string} collectionName name of collection in which to insert learning object
   * @param {string} [submissionReason] reason for submitting a learning object to a collection
   * @param {string[]} [selectedAuthorizations] authorizations that the author gave for changes
   * @return {Promise<any>}
   */
  submit(params: {
    userId: string,
    learningObjectId: string,
    collectionName: string,
    submissionReason?: string,
    selectedAuthorizations?: string[],
  }): Promise<any> {
    return this.http
      .post(
        USER_ROUTES.SUBMIT_LEARNING_OBJECT({
          userId: params.userId,
          learningObjectId: params.learningObjectId,
        }),
        {
          collection: params.collectionName,
          submissionReason: params.submissionReason,
          selectedAuthorizations: params.selectedAuthorizations
        },
        { withCredentials: true, responseType: 'text' }
      )
      .pipe(
        retry(3),
        catchError(this.handleError)
      )
      .toPromise();
  }

  unsubmit(params: {
    learningObjectId: string,
    userId: string,
  }): Promise<any> {
    return this.http
      .delete(
        USER_ROUTES.UNSUBMIT_LEARNING_OBJECT({
          userId: params.userId,
          learningObjectId: params.learningObjectId,
        }),
        { withCredentials: true, responseType: 'text' }
      )
      .pipe(
        retry(3),
        catchError(this.handleError)
      )
      .toPromise();
  }

  async getCollection(abvName: string): Promise<Collection> {
    return await this.getCollections().then(val => {
      for (const x of val) {
        if (x.abvName === abvName) {
          return x;
        }
      }
    });
  }

  getCollectionMetricsData(name: string) {
    return this.http.get(COLLECTIONS_ROUTES.GET_COLLECTION_METRICS(name))
      .pipe(
        retry(3),
        catchError(this.handleError)
      )
      .toPromise();

  }
  getCollectionCuratorsInfo(name: string) {
    return this.http.get(COLLECTIONS_ROUTES.GET_COLLECTION_CURATORS(name))
      .pipe(
        retry(3),
        catchError(this.handleError)
      )
      .toPromise();
  }
  getCollectionMetadata(name: string) {
    return this.http.get(PUBLIC_LEARNING_OBJECT_ROUTES.GET_COLLECTION_META(name))
      .pipe(
        retry(3),
        catchError(this.handleError)
      )
      .toPromise();
  }

  /**
   * Fetches Array of Learning Objects
   *
   * @returns {Promise<LearningObject[]>}
   * @memberof LearningObjectService
   */
  getLearningObjects(query?: Query): Promise<{ learningObjects: LearningObject[], total: number }> {
    let route = '';
    if (query) {
      const queryClone = Object.assign({}, query);
      if (
        queryClone.standardOutcomes &&
        queryClone.standardOutcomes.length &&
        typeof queryClone.standardOutcomes[0] !== 'string'
      ) {
        queryClone.standardOutcomes = queryClone.standardOutcomes.map(o => o['id']);
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
        return { learningObjects: objects.map(object => new LearningObject(object)), total: response.total };
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

  changeStatus502(status: boolean) {
    if (this.darkMode502.getValue() !== status) {
      this.darkMode502.next(status);
    }
  }
}
