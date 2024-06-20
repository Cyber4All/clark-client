import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  LEARNING_OBJECT_ROUTES,
  LEGACY_PUBLIC_LEARNING_OBJECT_ROUTES,
  LEGACY_USER_ROUTES
} from '../../../../../core/learning-object-module/learning-object/learning-object.routes';
import { LEARNING_OBJECT_ERRORS } from 'entity/learning-object/error-messages';

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
      LEARNING_OBJECT_ROUTES.GET_CHILDREN(
        username,
      ))
      .toPromise();

    return { parents, children };
  }
}
