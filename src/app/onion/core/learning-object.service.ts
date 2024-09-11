import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpHeaders,
  HttpErrorResponse
} from '@angular/common/http';
import { LearningObject, LearningOutcome } from '@entity';
import { CookieService } from 'ngx-cookie-service';
import { catchError, takeUntil } from 'rxjs/operators';
import { throwError, Subject, BehaviorSubject } from 'rxjs';
import { FileUploadMeta } from '../learning-object-builder/components/content-upload/app/services/typings';
import { SUBMISSION_ROUTES } from '../../core/learning-object-module/submissions/submissions.routes';
import { BUNDLING_ROUTES } from '../../core/learning-object-module/bundling/bundling.routes';
import { OUTCOME_ROUTES } from '../../core/learning-object-module/outcomes/outcome.routes';
import { FILE_ROUTES } from '../../core/learning-object-module/file/file.routes';
import {
  LEGACY_USER_ROUTES,
  LEGACY_PUBLIC_LEARNING_OBJECT_ROUTES,
  LEARNING_OBJECT_ROUTES,
  USER_ROUTES,
} from '../../core/learning-object-module/learning-object/learning-object.routes';
import { BundlingService } from 'app/core/learning-object-module/bundling/bundling.service';
import { UserService } from 'app/core/user-module/user.service';

@Injectable({
  providedIn: 'root'
})
export class LearningObjectService {
  learningObjects: LearningObject[] = [];
  private headers: HttpHeaders = new HttpHeaders();

  // Observable boolean to toogle download spinner in components
  private _loading$ = new BehaviorSubject<boolean>(false);

  // Public get for loading observable
  get loaded() {
    return this._loading$.asObservable();
  }

  constructor(
    private http: HttpClient,
    private cookies: CookieService,
    private bundlingService: BundlingService,
    private userService: UserService,
  ) {
    const token = this.cookies.get('presence');
    if (token !== null) {
      this.headers = new HttpHeaders().append(
        'Authorization',
        `${'Bearer ' + token}`
      );
    }
  }

  /**
   * Calls LO service to update the packageable status of toggled files
   *
   * @param learningObjectID The current learning object's ID
   * @param fileIDs An array of file IDs that need to be updated
   * @param state The new packageable property to update to
   * @returns A promise
   */
  toggleBundle(
    learningObjectId: string,
    fileIDs: string[],
    state: boolean
  ) {
    const route = BUNDLING_ROUTES.TOGGLE_BUNDLE_FILE({ learningObjectId });

    return this.http
      .patch(
        route,
        {
          fileIDs: fileIDs,
          packagable: state
        },
        { headers: this.headers, withCredentials: true }
      )
      .pipe(

        catchError(this.handleError)
      )
      .toPromise();
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
    const route = LEARNING_OBJECT_ROUTES.CREATE_LEARNING_OBJECT();

    return this.http
      .post(
        route,
        { object: learningObject },
        { headers: this.headers, withCredentials: true }
      )
      .pipe(
        catchError(this.handleError)
      )
      .toPromise()
      .then((res: any) => {
        res.id = res._id;

        const learningObject: LearningObject = new LearningObject(res);

        // Fetch the author of the learning object and set it as the
        // author of the learning object
        this.userService.getUser(res.authorID).then(user => {
          learningObject.author = user;
        });

        return learningObject;
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
    const route = LEGACY_USER_ROUTES.GET_LEARNING_OBJECT(learningObjectId);
    return this.http
      .get(route, { headers: this.headers, withCredentials: true })
      .pipe(

        catchError(this.handleError)
      )
      .toPromise()
      .then((response: any) => {
        return new LearningObject(response);
      });
  }

  /**
   * Fetches a learning objects revision
   *
   * @param username
   * @param learningObjectID
   * @param revisionID
   */
  getLearningObjectRevision(username: string, learningObjectID: string, revisionID: number) {
    const route = LEGACY_USER_ROUTES.GET_LEARNING_OBJECT_REVISION(username, learningObjectID, revisionID);
    return this.http
      .get(route, { headers: this.headers, withCredentials: true })
      .pipe(

        catchError(this.handleError)
      )
      .toPromise()
      .then((res: any) => {
        return new LearningObject(res);
      });
  }

  /**
   * Fetches user's Learning Objects (partial)
   *
   * @returns {Promise<LearningObject[]>}
   * @memberof LearningObjectService
   */
  getLearningObjects(
    authorUsername: string,
    filters?: any,
  ): Promise<LearningObject[]> {
    const route = LEARNING_OBJECT_ROUTES.GET_MY_LEARNING_OBJECTS(authorUsername, filters);
    return this.http
      .get(route, { headers: this.headers, withCredentials: true })
      .pipe(

        catchError(this.handleError)
      )
      .toPromise()
      .then((response: any) => {
        return response.objects.map(object => new LearningObject(object));
      });
  }

  /**
   * Fetches user's Learning Objects (partial)
   *
   * @returns {Promise<LearningObject[]>}
   * @memberof LearningObjectService
   */
  getDraftLearningObjects(
    authorUsername: string,
    filters?: any,
    query?: string
  ): Promise<LearningObject[]> {
    const route = LEARNING_OBJECT_ROUTES.GET_MY_DRAFT_LEARNING_OBJECTS(authorUsername, filters, query);
    return this.http
      .get(route, { headers: this.headers, withCredentials: true })
      .pipe(

        catchError(this.handleError)
      )
      .toPromise()
      .then((response: any) => {
        return response.objects;
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
  save(
    id: string,
    learningObject: Partial<LearningObject>,
    reason?: string,
  ): Promise<{}> {
    const route = LEARNING_OBJECT_ROUTES.UPDATE_LEARNING_OBJECT(id);
    return this.http
      .patch(
        route,
        { updates: learningObject, reason },
        { headers: this.headers, withCredentials: true, responseType: 'text' }
      )
      .pipe(

        catchError(this.handleError)
      )
      .toPromise();
  }

  /**
   * Add a guideline to the guidelines array of a Learning Outcome
   *
   * @param {string} learningObjectId the id of the source learning object
   * @param {{ id: string, [key: string]: any }} outcome the properties of the outcome to change
   * @param username The learning object author's username
   * @returns {Promise<any>}
   * @memberof LearningObjectService
   */
  addGuideline(
    learningObjectId: string,
    outcome: Partial<LearningOutcome>,
    username: string
  ): Promise<any> {
    const outcomeId = outcome.id;

    return this.http
      .post(
        LEGACY_USER_ROUTES.POST_MAPPING(username, learningObjectId, outcomeId),
        { guidelineID: outcome.mappings[outcome.mappings.length - 1] },
        { headers: this.headers, withCredentials: true }
      )
      .pipe(

        catchError(this.handleError)
      )
      .toPromise();
  }

  /**
   * Add a guideline to the guidelines array of a Learning Outcome
   *
   * @param {string} learningObjectId the id of the source learning object
   * @param {{ id: string, [key: string]: any }} outcome the properties of the outcome to change
   * @param username The learning object author's username
   * @returns {Promise<any>}
   * @memberof LearningObjectService
   */
  deleteGuideline(
    learningObjectId: string,
    outcome: string,
    username: string,
    mappingId: string,
  ): Promise<any> {

    return this.http
      .delete(
        LEGACY_USER_ROUTES.DELETE_MAPPING(username, learningObjectId, outcome, mappingId),
        { headers: this.headers, withCredentials: true }
      )
      .pipe(

        catchError(this.handleError)
      )
      .toPromise();
  }

  /**
   * Publish a learning object
   *
   * @param {LearningObject} learningObject the learning object to be published
   * @param {string} collection the abreviated name of the collection to which to submit this learning object
   */
  submit(learningObject: LearningObject, collection: string): Promise<{}> {
    const route = SUBMISSION_ROUTES.SUBMIT_LEARNING_OBJECT({
      learningObjectId: learningObject.id,
    });
    return this.http
      .post(
        route,
        { collection },
        { headers: this.headers, withCredentials: true, responseType: 'text' }
      )
      .pipe(

        catchError(this.handleError)
      )
      .toPromise();
  }

  /**
   * Function to initiate the bundling process for new and updated learning objects
   *
   * @param username Authors username of current learning object
   * @param learningObjectId id current learning object
   */
  async triggerBundle(learningObjectId: string) {
    await this.bundlingService.bundleLearningObject(learningObjectId);
  }

  /**
   * Sends Learning Object's ID to API for deletion
   *
   * @param {(string)} id
   * @returns {Promise<{}>}
   * @memberof LearningObjectService
   */
  delete(learningObjectId: string): Promise<{}> {
    const route = LEARNING_OBJECT_ROUTES.DELETE_LEARNING_OBJECT(
      learningObjectId
    );
    return this.http
      .delete(route, {
        headers: this.headers,
        withCredentials: true,
        responseType: 'json'
      })
      .pipe(
        catchError(this.handleError)
      )
      .toPromise();
  }

  /**
   * Method to delete multiple learning objects
   *
   * @param learningObjectIds Array of learning object ids to delete
   * @returns Promise of all delete requests
   */
  deleteMultiple(learningObjectIds: string[]): Promise<any> {
    const deletePromises = learningObjectIds.map(objectId =>
      this.http.delete(LEARNING_OBJECT_ROUTES.DELETE_LEARNING_OBJECT(objectId), {
        headers: this.headers,
        withCredentials: true,
        responseType: 'text'
      })
      .pipe(
        catchError(this.handleError)
      )
      .toPromise()
    );

    return Promise.all(deletePromises);
  }

  setChildren(
    learningObjectId: string,
    children: string[],
    remove: boolean,
  ): Promise<any> {
    const removeRoute = LEARNING_OBJECT_ROUTES.REMOVE_CHILD(learningObjectId);
    const addRoute = LEARNING_OBJECT_ROUTES.UPDATE_CHILDREN(learningObjectId);
    if (remove) {
      return this.http
        .patch(
          removeRoute,
          { childObjectId: children[0] },
          { headers: this.headers, withCredentials: true, responseType: 'text' }
        )
        .pipe(
          catchError(this.handleError)
        )
        .toPromise();
    } else {
      return this.http
        .post(
          addRoute,
          { childrenIds: children },
          { headers: this.headers, withCredentials: true, responseType: 'text' }
        )
        .pipe(

          catchError(this.handleError)
        )
        .toPromise();
    }
  }

  /**
   * Fetches the parents of a learning object
   *
   * @param id of learning object
   */
  fetchParents(id: string) {
    const route = LEARNING_OBJECT_ROUTES.GET_LEARNING_OBJECT_PARENTS(id);
    return this.http.get<LearningObject[]>(route, { withCredentials: true }).toPromise().then(parents => {
      return parents;
    });
  }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // Client-side or network returned error
      return throwError(error.error.message);
    } else {
      // API returned error
      return throwError(error);
    }
  }
}
