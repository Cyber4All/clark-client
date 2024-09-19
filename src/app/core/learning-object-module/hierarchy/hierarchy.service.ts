import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HIERARCHY_ROUTES } from './hierarchy.routes';

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
}
