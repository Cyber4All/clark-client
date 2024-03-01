import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  LEGACY_PUBLIC_LEARNING_OBJECT_ROUTES,
  LEGACY_USER_ROUTES
} from '../../../../../core/learning-object-module/learning-object/learning-object.routes';

@Injectable({
  providedIn: 'root'
})
export class AttributeService {

  constructor(private http: HttpClient) { }

  async getHierarchy(username: string, objectId: string): Promise<{ parents: any, children: any }> {
    const parents = await this.http.get(
      LEGACY_PUBLIC_LEARNING_OBJECT_ROUTES.GET_LEARNING_OBJECT_PARENTS(
        username,
        objectId
      ))
      .toPromise();
    const children = await this.http.get(
      LEGACY_USER_ROUTES.GET_CHILDREN(
        username,
        objectId
      ))
      .toPromise();

    return { parents, children };
  }
}
