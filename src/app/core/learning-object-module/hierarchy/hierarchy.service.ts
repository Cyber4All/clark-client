import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HIERARCHY_ROUTES } from './hierarchy.routes';
import { SEARCH_ROUTES } from '../search/search.routes';

@Injectable({
  providedIn: 'root'
})
export class HierarchyService {

  constructor(private http: HttpClient) { }


  async addHierarchyObject(username: string, object: any): Promise<any> {
    return await this.http.post(
      HIERARCHY_ROUTES.ADD_NEW_HIERARCHY_OBJECT(),
      { object, username }, { withCredentials: true, responseType: 'text' }
    ).toPromise();
  }

  /**
   * Checks if the name of the learning object is already taken for the author
   *
   * @param username the username of the author
   * @param objectName the objectName to check for
   * @returns
   */
  // TODO: Wherever this is used, it should be refactored to the use the SearchService getUserLearningObjects method
  async checkName(username: string, objectName: string): Promise<boolean> {
    return this.http
      .get(SEARCH_ROUTES.GET_USERS_LEARNING_OBJECTS(username, `text=${objectName}`), { withCredentials: true })
      .toPromise()
      .then((response: any) => {
        const possibleMatches = response.map(object => {
          return object.name;
        });
        return possibleMatches.includes(objectName) ? true : false;
      });
  }
}
