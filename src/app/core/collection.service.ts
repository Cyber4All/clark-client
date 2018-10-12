import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import 'rxjs/add/operator/map';

import { USER_ROUTES, PUBLIC_LEARNING_OBJECT_ROUTES } from '@env/route';
import { BehaviorSubject } from 'rxjs';
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
  addToCollection(
    learningObjectId: string,
    collectionName: string
  ): Promise<any> {
    return this.http
      .patch(
        USER_ROUTES.ADD_LEARNING_OBJET_TO_COLLECTION(learningObjectId),
        { collection: collectionName },
        { withCredentials: true, responseType: 'text' }
      )
      .toPromise();
  }
}
