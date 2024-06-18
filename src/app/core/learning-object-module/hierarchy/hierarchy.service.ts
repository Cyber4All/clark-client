import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LearningObject } from '@entity';
import { LEGACY_ADMIN_ROUTES, LEGACY_USER_ROUTES } from '../learning-object/learning-object.routes';
import { HIERARCHY_ROUTES } from './hierarchy.routes';

@Injectable({
  providedIn: 'root'
})
export class HierarchyService {

  constructor(private http: HttpClient) { }


  async addHierarchyObject(username: string, object: any): Promise<any> {
    return await this.http.post(
      LEGACY_ADMIN_ROUTES.ADD_HIERARCHY_OBJECT(username),
      { object }, { withCredentials: true, responseType: 'text' }
    ).toPromise();
  }

  /**
   * Releases an entire hierarchy from the admin dashboard, should
   * only be called for root objects, but can be used for subtrees
   * according to Hierarchy Service docs.
   *
   * @param id id of the root learning object of a hierarchy
   * @returns A promise
   */
  async releaseHierarchy(id: string): Promise<any> {
    return await this.http.patch(
      HIERARCHY_ROUTES.CHANGE_HIERARCHY_STATUS(id),
      {
        status: LearningObject.Status.RELEASED
      },
      { withCredentials: true, responseType: 'json' }
    ).toPromise();
  }

  /**
   * Submits an entire hierarchy from the user dashboard, should
   * only be called for root objects, but can be used for subtrees
   * according to Hierarchy Service docs.
   *
   * @param id id of the root learning object of a hierarchy
   * @param collection the collection the objects will belong to
   * @returns A promise
   */
  async submitHierarchy(id: string, collection: string): Promise<any> {
    return await this.http.patch(
      HIERARCHY_ROUTES.CHANGE_HIERARCHY_STATUS(id),
      {
        status: LearningObject.Status.WAITING,
        collection: collection
      },
      { withCredentials: true, responseType: 'json' }
    ).toPromise();
  }
  /**
   * Adds children to a learning object
   *
   * @param username the username of the author
   * @param learningObjectId the Id of the learning object having children
   * @param children the children to be had
   * @returns
   */
  async addChildren(learningObjectId: string, children): Promise<any> {
    return await this.http.post(
      LEGACY_USER_ROUTES.UPDATE_CHILDREN(learningObjectId),
      {
        children
      },
      {
        withCredentials: true,
        responseType: 'text'
      }
    ).toPromise();
  }

  /**
   * Checks if the name of the learning object is already taken for the author
   *
   * @param username the username of the author
   * @param objectName the objectName to check for
   * @returns
   */
  async checkName(username: string, objectName: string): Promise<boolean> {
    return this.http
      .get(LEGACY_USER_ROUTES.GET_MY_LEARNING_OBJECTS(username, {}, objectName), { withCredentials: true })
      .toPromise()
      .then((response: any) => {
        const possibleMatches = response.map(object => {
          return object.name;
        });
        return possibleMatches.includes(objectName) ? true : false;
      });
  }
}
