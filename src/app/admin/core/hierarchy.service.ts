import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LearningObject } from '@entity';
import { ADMIN_ROUTES, USER_ROUTES } from '@env/route';
import { catchError, retry } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class HierarchyService {

  constructor(private http: HttpClient) { }


  async addHierarchyObject(username: string, object: any): Promise<any> {
    return await this.http.post(                                            
      ADMIN_ROUTES.ADD_HIERARCHY_OBJECT(username),
      { object }, { withCredentials: true, responseType: 'text'}
    ).toPromise();
  }

  async addChildren(username: string, object: any, children): Promise<any> {
    return await this.http.post(
      USER_ROUTES.SET_CHILDREN(username, object),
      {
        children
      },
      {
        withCredentials: true,
        responseType: 'text'
      }
    ).toPromise();
  }

  async checkName(username: string, objectName: string): Promise<boolean> {
    return this.http
      .get(USER_ROUTES.GET_MY_LEARNING_OBJECTS(username, {}, objectName), { withCredentials: true })
      .pipe(
        retry(3)
      )
      .toPromise()
      .then((response: any) => {
        const possibleMatches = response.map(object => {
          return object.name;
        });
        return possibleMatches.includes(objectName) ? true : false;
      });
  }
}
