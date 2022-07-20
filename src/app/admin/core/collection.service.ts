import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LearningObject } from '@entity';
import { ADMIN_ROUTES, USER_ROUTES } from '@env/route';

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
      ADMIN_ROUTES.UPDATE_OBJECT_SUBMITTED_COLLECTION(username, cuid),
      { collection }, { withCredentials: true,  responseType: 'text' }
    ).toPromise();
  }

  async addHierarchyObject(username: string, object: any): Promise<any> {
    return await this.http.post(                                            
      ADMIN_ROUTES.ADD_HIERARCHY_OBJECT(username),
      { object }, { withCredentials: true, responseType: 'text'}
    ).toPromise();
  }

  async addChildren(username: string, object: any, children): Promise<any> {
    return await this.http.post(
      USER_ROUTES.SET_CHILDREN(username, object._id),
      {
        children
      }
    ).toPromise();
  }
}
