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
import { REVISION_ROUTES } from '../../core/learning-object-module/revisions/revisions.routes';
import { FILE_ROUTES } from '../../core/learning-object-module/file/file.routes';
import {
  LEGACY_USER_ROUTES,
  LEGACY_PUBLIC_LEARNING_OBJECT_ROUTES,
  LEARNING_OBJECT_ROUTES,
} from '../../core/learning-object-module/learning-object/learning-object.routes';

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
    private cookies: CookieService
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
        return new LearningObject(res);
      });
    // TODO: Verify this response gives the learning object name
  }

  /**
   * Creates a Revision of an existing learning object
   *
   * @param learningObjectId
   * @param authorUsername
   */
  createRevision(cuid: string) {
    const route = REVISION_ROUTES.CREATE_REVISION(cuid);
    return this.http
      .post(
        route, {},
        { withCredentials: true }
      )
      .pipe(

        catchError(this.handleError)
      )
      .toPromise().then(response => {
        return response;
      });
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
    const route = LEARNING_OBJECT_ROUTES.GET_MY_DRAFT_LEARNING_OBJECTS(authorUsername);
    return this.http
      .get(route, { headers: this.headers, withCredentials: true })
      .pipe(

        catchError(this.handleError)
      )
      .toPromise()
      .then((response: any) => {
        console.log(response);
        return response.objects.map(object => new LearningObject(object));
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
   * Modify an outcome by sending a partial learning outcome
   *
   * @param {string} learningObjectId the id of the source learning object
   * @param {{ id: string, [key: string]: any }} outcome the properties of the outcome to change
   * @returns {Promise<any>}
   * @memberof LearningObjectService
   */
  saveOutcome(
    learningObjectId: string,
    outcome: { id: string;[key: string]: any }
  ): Promise<any> {
    const outcomeId = outcome.id;
    delete outcome.id;

    return this.http
      .patch(
        OUTCOME_ROUTES.UPDATE_OUTCOME(learningObjectId, outcomeId),
        { outcome },
        { withCredentials: true }
      )
      .pipe(

        catchError(this.handleError)
      )
      .toPromise();
  }

  /**
   * Deletes an outcome on a given learning object
   *
   * @param outcomeId The outcome Id
   */
  deleteOutcome(outcomeId: string): Promise<any> {
    return this.http
      .delete(OUTCOME_ROUTES.DELETE_OUTCOME(outcomeId), { headers: this.headers, withCredentials: true })
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
      learningObjectId: learningObject._id,
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
  triggerBundle(username: string, learningObjectId: string) {
    const route = BUNDLING_ROUTES.BUNDLE_LEARNING_OBJECT(
      username,
      learningObjectId
    );
    // POST needs the body arrgument
    return this.http
      .post(
        route,
        {},
        { headers: this.headers, withCredentials: true }
      )
      .pipe(
        catchError(this.handleError)
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
  delete(learningObjectId: string): Promise<{}> {
    const route = LEGACY_USER_ROUTES.DELETE_LEARNING_OBJECT(
      learningObjectId
    );
    return this.http
      .delete(route, {
        headers: this.headers,
        withCredentials: true,
        responseType: 'text'
      })
      .pipe(

        catchError(this.handleError)
      )
      .toPromise();
  }

  /**
   * Bulk deletion
   *
   * @param {(string)[]} ids
   * @returns {Promise<{}>}
   * @memberof LearningObjectService
   */
  deleteMultiple(names: string[], authorUsername: string): Promise<any> {
    const route = LEGACY_USER_ROUTES.DELETE_MULTIPLE_LEARNING_OBJECTS(authorUsername, names);

    return this.http
      .delete(route, {
        headers: this.headers,
        withCredentials: true,
        responseType: 'text'
      })
      .pipe(

        catchError(this.handleError)
      )
      .toPromise();
  }

  setChildren(
    learningObjectName: string,
    authorUsername: string,
    children: string[],
    remove: boolean,
  ): Promise<any> {
    const route = LEGACY_USER_ROUTES.SET_CHILDREN(authorUsername, learningObjectName);

    if (remove) {
      return this.http
        .patch(
          route,
          { id: children[0] },
          { withCredentials: true, responseType: 'text' }
        )
        .pipe(

          catchError(this.handleError)
        )
        .toPromise();
    } else {
      return this.http
        .post(
          route,
          { children },
          { withCredentials: true, responseType: 'text' }
        )
        .pipe(

          catchError(this.handleError)
        )
        .toPromise();
    }
  }

  async updateReadme(id: string): Promise<any> {
    return await this.http.patch(
      FILE_ROUTES.UPDATE_PDF(id),
      {},
      {
        headers: this.headers,
        withCredentials: true,
        responseType: 'text'
      }
    )
      .pipe(

        catchError(this.handleError)
      ).toPromise();
  }

  /**
   * Fetches the parents of a learning object
   *
   * @param id of learning object
   */
  fetchParents(username: string, id: string) {
    const route = LEGACY_PUBLIC_LEARNING_OBJECT_ROUTES.GET_LEARNING_OBJECT_PARENTS(username, id);
    return this.http.get<LearningObject[]>(route, { withCredentials: true }).toPromise().then(parents => {
      return parents;
    });
  }

  /**
   * Adds file meta to a Learning Object's materials
   * Adding files are handled by a job queue to avoid sending too large of a payload to the server
   *
   * @param {string} authorUsername [The Learning Object's author's username]
   * @param {string} objectId [The Id of the Learning Object]
   * @param {FileUploadMeta[]} files [List of file meta to be added]
   * @returns {Promise<string[]>}
   * @memberof LearningObjectService
   */
  addFileMeta({
    username,
    objectId,
    files
  }: {
    username: string;
    objectId: string;
    files: FileUploadMeta[];
  }): Promise<string[]> {
    const route = FILE_ROUTES.UPLOAD_FILE_META(username, objectId);
    return this.handleFileMetaRequests(files, route);
  }

  /**
   * Handles file meta data requests
   *
   * *** NOTE ***
   * Requests are handled in batches if data payload is too large (Will only send at most `MAX_PER_REQUEST` file meta in a single request)
   *
   * @private
   * @param {FileUploadMeta[]} files [List of file meta to be added]
   * @param {string} route [Route to make request to]
   * @returns
   * @memberof LearningObjectService
   */
  private handleFileMetaRequests(
    files: FileUploadMeta[],
    route: string
  ): Promise<string[]> {
    const MAX_PER_REQUEST = 100;
    const responses$: Promise<string[]>[] = [];
    const completed$: Subject<boolean> = new Subject<boolean>();
    const sendNextBatch$: Subject<void> = new Subject<void>();

    const response = new Promise<string[]>((resolve, reject) => {
      sendNextBatch$.pipe(takeUntil(completed$)).subscribe(() => {
        const batch = files.splice(0, MAX_PER_REQUEST);
        if (batch.length) {
          this.handleFileMetaBatch(route, batch, responses$, sendNextBatch$);
        } else {
          this.handleFileMetaRequestQueueCompletion(completed$, responses$)
            .then(resolve)
            .catch(reject);
        }
      });
    });
    sendNextBatch$.next();
    return response;
  }

  /**
   * Handles making request to upload batch of file meta
   *
   * @private
   * @param {string} route [Route to make request to]
   * @param {FileUploadMeta[]} batch [Batch of file meta to be added]
   * @param {Promise<string[]>[]} responses$ [List of response promises to append to]
   * @param {Subject<void>} sendNextBatch$ [Observable used to signal that the next batch should be sent]
   * @memberof LearningObjectService
   */
  private handleFileMetaBatch(
    route: string,
    batch: FileUploadMeta[],
    responses$: Promise<string[]>[],
    sendNextBatch$: Subject<void>
  ) {
    const response$ = this.http
      .post(route, { fileMeta: batch }, { withCredentials: true })
      .pipe(

        catchError(this.handleError)
      )
      .toPromise()
      .then((res: { fileMetaId: string[] }) => res.fileMetaId);
    responses$.push(response$);
    sendNextBatch$.next();
  }
  /**
   * Handles completion of requests for all file metadata that was enqueued
   *
   * @private
   * @param {Subject<boolean>} completed$ [Observable used to signal that all batches have been completed]
   * @param {Promise<string[]>[]} responses$ [List of response promises to resolve]
   * @returns
   * @memberof LearningObjectService
   */
  private async handleFileMetaRequestQueueCompletion(
    completed$: Subject<boolean>,
    responses$: Promise<string[]>[]
  ): Promise<string[]> {
    completed$.next(true);
    completed$.unsubscribe();
    const fileIdsArrays = await Promise.all(responses$);
    const fileIds = flattenDeep(fileIdsArrays);
    return fileIds;
  }

  /**
   * Fetches Learning Object's Materials
   *
   * @param {string} authorUsername
   * @param {string} objectId
   * @param {string} description
   * @returns {Promise<any>}
   * @memberof LearningObjectService
   */
  getMaterials(username: string, objectId: string): Promise<any> {
    const route = FILE_ROUTES.GET_MATERIALS(username, objectId, 'unreleased');
    return this.http.get(route, { withCredentials: true })
      .pipe(

        catchError(this.handleError)
      )
      .toPromise();
  }
  /**
   * Makes request to update file description
   *
   * @param {string} authorUsername
   * @param {string} objectId
   * @param {string} fileId
   * @param {string} description
   * @returns {Promise<any>}
   * @memberof LearningObjectService
   */
  updateFileDescription(
    authorUsername: string,
    objectId: string,
    fileId: string,
    description: string
  ): Promise<any> {
    const route = FILE_ROUTES.UPDATE_FILE(
      authorUsername,
      objectId,
      fileId
    );
    return this.http
      .patch(
        route,
        { description },
        { withCredentials: true, responseType: 'text' }
      )
      .pipe(

        catchError(this.handleError)
      )
      .toPromise();
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

/**
 * Flattens nested arrays
 *
 * Taken from: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flat
 *
 * @param {any[]} arr1 [Array with nested arrays to be flattened]
 * @returns
 */
function flattenDeep(arr1: any[]): any[] {
  return arr1.reduce(
    (acc, val) =>
      Array.isArray(val) ? acc.concat(flattenDeep(val)) : acc.concat(val),
    []
  );
}
