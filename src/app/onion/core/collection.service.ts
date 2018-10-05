import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import 'rxjs/add/operator/map';
import { LearningObject } from '@cyber4all/clark-entity';
import { CookieService } from 'ngx-cookie';

import { USER_ROUTES, PUBLIC_LEARNING_OBJECT_ROUTES } from '@env/route';
import { AuthService } from '../../core/auth.service';

export interface Collection {
  name: string;
  abvName: string;
  hasLogo: boolean;
}

@Injectable()
export class CollectionService {

  constructor(private http: HttpClient, private auth: AuthService) { }

  /**
   * Retrieve a list of collections
   * @return {Collection[]} list of collections
   */
  getCollections(): Promise<Collection[]> {
    return this.http.get(PUBLIC_LEARNING_OBJECT_ROUTES.GET_COLLECTIONS).toPromise().then((val: Collection[]) => {
      return val;
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
