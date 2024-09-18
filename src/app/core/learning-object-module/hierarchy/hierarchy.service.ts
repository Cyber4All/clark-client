import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LearningObject } from '@entity';
import { ADMIN_ROUTES, LEARNING_OBJECT_ROUTES } from '../learning-object/learning-object.routes';
import { HIERARCHY_ROUTES } from './hierarchy.routes';

@Injectable({
  providedIn: 'root'
})
export class HierarchyService {

  constructor(private http: HttpClient) { }


  async addHierarchyObject(username: string, learningObject: LearningObject): Promise<any> {
    return await this.http.post(
      ADMIN_ROUTES.ADD_HIERARCHY_OBJECT(),
      { object: learningObject, username }, { withCredentials: true, responseType: 'text' }
    ).toPromise();
  }

  /**
   * Releases an entire hierarchy from the admin dashboard, should
   * only be called for root objects, but can be used for subtrees
   * according to Hierarchy Service docs.
   *
   * @param learningObjectId id of the root learning object of a hierarchy
   * @returns A promise
   */
  async releaseHierarchy(learningObjectId: string): Promise<any> {
    return await this.http.patch(
      HIERARCHY_ROUTES.CHANGE_HIERARCHY_STATUS(learningObjectId),
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
   * @param learningObjectId id of the root learning object of a hierarchy
   * @param collection the collection the objects will belong to
   * @returns A promise
   */
  async submitHierarchy(learningObjectId: string, collection: string): Promise<any> {
    return await this.http.patch(
      HIERARCHY_ROUTES.CHANGE_HIERARCHY_STATUS(learningObjectId),
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
   * @param parent the object having children
   * @param children the children to be had
   * @returns
   */
  async addChildren(parent: LearningObject, children: LearningObject): Promise<any> {
    return await this.http.post(
      LEARNING_OBJECT_ROUTES.UPDATE_CHILDREN(parent.id),
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
   * @param learningObjectName the objectName to check for
   * @returns
   */
  async checkName(username: string, learningObjectName: string): Promise<boolean> {
    return this.http
      .get(LEARNING_OBJECT_ROUTES.GET_MY_LEARNING_OBJECTS(username, {text: learningObjectName}), { withCredentials: true })
      .toPromise()
      .then((response: any) => {
        const possibleMatches = response.map(object => {
          return object.name;
        });
        return possibleMatches.includes(learningObjectName) ? true : false;
      });
  }
}
