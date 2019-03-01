import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { USER_ROUTES, PUBLIC_LEARNING_OBJECT_ROUTES } from '@env/route';
import { BehaviorSubject, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { skipWhile } from 'rxjs/operators';

export interface Collection {
  name: string;
  abvName: string;
  hasLogo: boolean;
}

@Injectable()
export class CollectionService {
  private collections: Collection[];
  private loading$ = new BehaviorSubject<boolean>(true);
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
      .then((collections: Collection[]) => {
        this.collections = collections;
        this.loading$.next(false);
        return collections;
      });
  }

  /**
   * Retrieve a list of collections
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
   * @param {string} learningObjectId id of learning object to be added to collection
   * @param {string} collectionName name of collection in which to insert learning object
   * @return {Promise<any>}
   */
  submit(
    learningObjectId: string,
    collectionName: string
  ): Promise<any> {
    return this.http
      .post(
        USER_ROUTES.SUBMIT_LEARNING_OBJECT(learningObjectId),
        { collection: collectionName },
        { withCredentials: true, responseType: 'text' }
      )
      .pipe(
        retry(3),
        catchError(this.handleError)
      )
      .toPromise();
  }

  unsubmit(
    learningObjectId: string
  ): Promise<any> {
    return this.http
      .delete(
        USER_ROUTES.UNSUBMIT_LEARNING_OBJECT(learningObjectId),
        { withCredentials: true, responseType: 'text' }
      )
      .pipe(
        retry(3),
        catchError(this.handleError)
      )
      .toPromise();
  }

  getCollection(abvName: string): Promise<Collection> {
    return this.getCollections().then(val => {
      for (const x of val) {
        if (x.abvName === abvName) {
          return x;
        }
      }
    });
  }

  getCollectionMetadata(name: string) {
    return this.http.get(PUBLIC_LEARNING_OBJECT_ROUTES.GET_COLLECTION_META(name))
      .pipe(
        retry(3),
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
