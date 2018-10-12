import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import 'rxjs/add/operator/map';

import { USER_ROUTES, PUBLIC_LEARNING_OBJECT_ROUTES } from '@env/route';

export interface Collection {
  name: string;
  abvName: string;
  hasLogo: boolean;
}

@Injectable()
export class CollectionService {
  private collections: Collection[];
  constructor(private http: HttpClient) { }

  /**
   * Retrieve a list of collections
   * @return {Collection[]} list of collections
   */
  getCollections(): Promise<Collection[]> {
    return this.collections
      ? Promise.resolve(this.collections)
      : this.http.get(PUBLIC_LEARNING_OBJECT_ROUTES.GET_COLLECTIONS, { withCredentials: true })
          .toPromise()
          .then((collections: Collection[]) => {
            this.collections = collections;
            console.log(collections);
            return collections;
          });
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
