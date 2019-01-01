import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import 'rxjs/add/operator/map';
import { LearningObject, LearningOutcome } from '@cyber4all/clark-entity';
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
      .toPromise()
      .then((res: any) => {
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
  getLearningObject(learningObjectId: string): Promise<LearningObject> {
    const route = USER_ROUTES.GET_LEARNING_OBJECT(learningObjectId);
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
    const route = USER_ROUTES.GET_MY_LEARNING_OBJECTS(
      this.auth.user.username,
      filters
    );
    return this.http
      .get(route, { headers: this.headers, withCredentials: true })
      .toPromise()
      .then((response: any) => {
        return response.map(object => LearningObject.instantiate(object));
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
  // TODO type this parameter
  save(id: string, learningObject: { [key: string]: any }): Promise<{}> {
    const route = USER_ROUTES.UPDATE_MY_LEARNING_OBJECT(
      this.auth.user.username,
      id
    );
    return this.http
      .patch(
        route,
        { learningObject },
        { headers: this.headers, withCredentials: true, responseType: 'text' }
      )
      .toPromise();
  }

  /**
   * Modify an outcome by sending a partial learning outcome
   *
   * @param {string} learningObjectId the id of the source learning object
   * @param {{ id: string, [key: string]: any }} outcome the properties of the outcome to change
   * @returns {Promise<any>}
   * @memberof LearningObjectService
   */
  saveOutcome(
    learningObjectId: string,
    outcome: { id: string; [key: string]: any }
  ): Promise<any> {
    const outcomeId = outcome.id;
    delete outcome.id;

    return this.http
      .patch(
        USER_ROUTES.MODIFY_MY_OUTCOME(learningObjectId, outcomeId),
        { outcome },
        { withCredentials: true }
      )
      .toPromise();
  }

  deleteOutcome(learningObjectId: string, outcomeId: string): Promise<any> {
    return this.http
      .delete(USER_ROUTES.DELETE_OUTCOME(learningObjectId, outcomeId), { withCredentials: true })
      .toPromise();
  }

  /**
   * Publish a learning object
   * @param {LearningObject} learningObject the learning object to be published
   * @param {string} collection the abreviated name of the collection to which to submit this learning object
   */
  submit(learningObject: LearningObject, collection: string): Promise<{}> {
    const route = USER_ROUTES.SUBMIT_LEARNING_OBJECT(
      learningObject.id
    );
    return this.http
      .post(
        route,
        { collection },
        { headers: this.headers, withCredentials: true, responseType: 'text' }
      )
      .toPromise();
  }

  /**
   * Unsubmit a learning object
   * @param {learningObject} learningObject the learning object to be unpublished
   */
  unsubmit(learningObject: LearningObject) {
    const route = USER_ROUTES.UNSUBMIT_LEARNING_OBJECT(
      learningObject.id
    );

    return this.http
      .delete(
        route,
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
      .delete(route, {
        headers: this.headers,
        withCredentials: true,
        responseType: 'text'
      })
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
      .delete(route, {
        headers: this.headers,
        withCredentials: true,
        responseType: 'text'
      })
      .toPromise();
  }

  setChildren(learningObjectName: string, children: string[]): Promise<any> {
    const route = USER_ROUTES.SET_CHILDREN(
      this.auth.user.username,
      learningObjectName
    );

    return this.http
      .post(
        route,
        { children },
        { withCredentials: true, responseType: 'text' }
      )
      .toPromise();
  }

  updateReadme(username: string, id: string): any {
    const route = USER_ROUTES.UPDATE_PDF(username, id);
    return this.http.patch(
      route,
      {},
      { withCredentials: true, responseType: 'text' }
    );
  }
  /**
   * Fetches Learning Object's Materials
   *
   * @param {string} username
   * @param {string} objectId
   * @param {string} description
   * @returns {Promise<any>}
   * @memberof LearningObjectService
   */
  getMaterials(username: string, objectId: string): Promise<any> {
    const route = USER_ROUTES.GET_MATERIALS(username, objectId);
    return this.http.get(route, { withCredentials: true }).toPromise();
  }
  /**
   * Makes request to update file description
   *
   * @param {string} username
   * @param {string} objectId
   * @param {string} fileId
   * @param {string} description
   * @returns {Promise<any>}
   * @memberof LearningObjectService
   */
  updateFileDescription(
    username: string,
    objectId: string,
    fileId: string,
    description: string
  ): Promise<any> {
    const route = USER_ROUTES.UPDATE_FILE_DESCRIPTION(
      username,
      objectId,
      fileId
    );
    return this.http
      .patch(
        route,
        { description },
        { withCredentials: true, responseType: 'text' }
      )
      .toPromise();
  }

  /**
   * Create an outcome for a source learning object
   *
   * @param {LearningObject} source the learningObject
   * @param {LearningOutcome} outcome
   * @memberof LearningObjectService
   */
  addLearningOutcome(sourceId: string, outcome: LearningOutcome): Promise<any> {
    return this.http
      .post(
        USER_ROUTES.CREATE_AN_OUTCOME(sourceId),
        { source: sourceId, outcome },
        { withCredentials: true, responseType: 'text' }
      )
      .toPromise();
  }
}
