import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LEGACY_COLLECTIONS_ROUTES } from 'app/core/learning-object-module/learning-object/learning-object.routes';

@Injectable({
  providedIn: 'root'
})
export class CollectionService {

  constructor(private http: HttpClient) { }

  /**
   * Changes the collection of an in review object
   *
   * @param username The username of the object's author
   * @param cuid The cuid of the object
   * @param collection The collection changing to
   */
  async updateSubmittedCollection(cuid: string, collection: string) {
    await this.http.patch(
      LEGACY_COLLECTIONS_ROUTES.UPDATE_LEARNING_OBJECT_COLLECTION(cuid),
      { collection }, { withCredentials: true, responseType: 'text' }
    ).toPromise();
  }
}
