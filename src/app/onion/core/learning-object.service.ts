import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import 'rxjs/add/operator/map';
import { LearningObject } from '@cyber4all/clark-entity';
import { CookieService } from 'ngx-cookie';

import { USER_ROUTES } from '@env/route';
import { AuthService } from '../../core/auth.service';

@Injectable()
export class LearningObjectService {
  learningObjects: LearningObject[] = [];
  private headers: HttpHeaders = new HttpHeaders();

  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private cookies: CookieService
  ) {
    const token = this.cookies.get('presence');
    this.headers.append('Content-Type', 'application/json');
  }

  /**
   * Sends serialized Learning Object to API for creation
   * Returns new Learningbject's ID on success
   * Returns error on error
   *
   * @param {any} learningObject
   * @returns {Promise<string>}
   * @memberof LearningObjectService
   */
  create(learningObject): Promise<LearningObject> {
    const route = USER_ROUTES.ADD_TO_MY_LEARNING_OBJECTS(
      this.auth.user.username
    );

    return this.http
      .post(
        route,
        { object: learningObject },
        { headers: this.headers, withCredentials: true }
      )
      .toPromise().then((res: any) => {
        return LearningObject.instantiate(res);
      });
    // TODO: Verify this response gives the learning object name
  }
  /**
   * Fetches Learning Object by ID (full)
   *
   * @param {string} learningObjectID
   * @returns {Promise<LearningObject>}
   * @memberof LearningObjectService
   */
  getLearningObject(learningObjectName: string): Promise<any> {
    const route = USER_ROUTES.GET_LEARNING_OBJECT(
      this.auth.user.username,
      learningObjectName
    );
    return this.http
      .get(route, { headers: this.headers, withCredentials: true })
      .toPromise()
      .then((response: any) => {
        return LearningObject.instantiate(response);
      });
  }

  /**
   * Fetches user's Learning Objects (partial)
   *
   * @returns {Promise<LearningObject[]>}
   * @memberof LearningObjectService
   */
  getLearningObjects(filters?: any): Promise<LearningObject[]> {
    const route = USER_ROUTES.GET_MY_LEARNING_OBJECTS(this.auth.user.username, filters);
    return this.http
      .get(route, { headers: this.headers, withCredentials: true })
      .toPromise()
      .then((response: any) => {
        return response
          .map(object => LearningObject.instantiate(object));
      });
  }
  /**
   * Sends updated Learning Object to API for updating.
   * Returns null success.
   * Returns error on error
   *
   * @param {string} id
   * @param {LearningObject} learningObject
   * @returns {Promise<{}>}
   * @memberof LearningObjectService
   */
  save(learningObject: LearningObject): Promise<{}> {
    const route = USER_ROUTES.UPDATE_MY_LEARNING_OBJECT(
      this.auth.user.username,
      learningObject.id || learningObject._id
    );
    return this.http
      .patch(
        route,
        { learningObject: learningObject },
        { headers: this.headers, withCredentials: true, responseType: 'text' }
      )
      .toPromise();
  }
  /**
   * Sends updated Learning Object to API for updating.
   * Returns null success.
   * Returns error on error
   *
   * @param {string} id
   * @param {LearningObject} learningObject
   * @returns {Promise<{}>}
   * @memberof LearningObjectService
   */
  togglePublished(learningObject: LearningObject): Promise<{}> {
    const route = !learningObject.published
      ? USER_ROUTES.PUBLISH_LEARNING_OBJECT(
          this.auth.user.username,
          learningObject.name
        )
      : USER_ROUTES.UNPUBLISH_LEARNING_OBJECT(
          this.auth.user.username,
          learningObject.name
        );
    return this.http
      .patch(
        route,
        {
          id: learningObject.id,
          published: !learningObject.published
        },
        { headers: this.headers, withCredentials: true, responseType: 'text' }
      )
      .toPromise();
  }
  /**
   * Sends Learning Object's ID to API for deletion
   *
   * @param {(string)} id
   * @returns {Promise<{}>}
   * @memberof LearningObjectService
   */
  delete(learningObjectName: string): Promise<{}> {
    const route = USER_ROUTES.DELETE_LEARNING_OBJECT(
      this.auth.user.username,
      learningObjectName
    );
    return this.http
      .delete(route, { headers: this.headers, withCredentials: true, responseType: 'text' })
      .toPromise();
  }

  /**
   * Bulk deletion
   *
   * @param {(string)[]} ids
   * @returns {Promise<{}>}
   * @memberof LearningObjectService
   */
  deleteMultiple(names: string[]): Promise<any> {
    const route = USER_ROUTES.DELETE_MULTIPLE_LEARNING_OBJECTS(
      this.auth.user.username,
      names
    );

    return this.http
      .delete(route, { headers: this.headers, withCredentials: true, responseType: 'text' })
      .toPromise();
  }

  setChildren(learningObjectName: string, children: string[]): Promise<any> {
    const route = USER_ROUTES.SET_CHILDREN(
      this.auth.user.username,
      learningObjectName
    );

    return this.http
      .post(route, { children }, { withCredentials: true, responseType: 'text' })
      .toPromise();
  }

  updateReadme(username: string, id: string): Promise<any> {
    const route = USER_ROUTES.UPDATE_PDF(username, id);
    return this.http.patch(route, {}, { withCredentials: true, responseType: 'text' }).toPromise();
  }
}
