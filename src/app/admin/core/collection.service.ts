import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ADMIN_ROUTES } from '@env/route';
import { COLLECTION_ROUTES } from '../../core/collection-module/collections.routes';

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
  async updateSubmittedCollection(username: string, cuid: string, collection: string) {
    await this.http.patch(
      COLLECTION_ROUTES.UPDATE_LEARNING_OBJECT_COLLECTION(username, cuid),
      { collection }, { withCredentials: true, responseType: 'text' }
    ).toPromise();
  }
}
