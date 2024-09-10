import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LearningObject, LearningOutcome } from '@entity';
import { merge, Observable, of, Subject, throwError } from 'rxjs';
import { catchError, finalize, map, mergeMap, take, takeUntil, tap } from 'rxjs/operators';
import { BUNDLING_ROUTES } from '../bundling/bundling.routes';
import {
  LEARNING_OBJECT_ROUTES,
} from '../learning-object/learning-object.routes';
import { UserService } from 'app/core/user-module/user.service';

export const CALLBACKS = {
  outcomes: (outcomes: any[]) => {
    return outcomes.map(o => new LearningOutcome(o));
  },
  ratings: (response: any) => {
    const ratings = response.ratings.map((r: any) => {
      const x = ({ ...r, id: r.id ? r.id : r._id });
      delete x._id;
      return x;
    });
    return { ...response, ratings };
  },
  children: (response: any[]) => {
    return response.map(r => new LearningObject(r));
  }
};

@Injectable({
  providedIn: 'root'
})
export class LearningObjectService {
  private headers = new HttpHeaders();

  constructor(
    private http: HttpClient,
    private userService: UserService
  ) { }

  // TODO: The following functions all use the same underlying route. They eventually should be condensed into
  // one function that handles all of the different types of requests that can be made to the learning object

  getLearningObjectObservable(
    params: { cuidInfo: { cuid: string, version?: number } },
  ): Observable<LearningObject | HttpErrorResponse> {
    const route = LEARNING_OBJECT_ROUTES.GET_LEARNING_OBJECT(params.cuidInfo.cuid, params.cuidInfo.version);
    return this.http.get(route).pipe(
      take(1),
      catchError(e => of(e)),
      map(response => {

        if (Array.isArray(response)) {
          if (response.length > 1) {
            response = response.filter(e => e.status === LearningObject.Status.RELEASED)[0];
          } else {
            response = response.pop();
          }
        }
        if (response instanceof HttpErrorResponse) {
          return response;
        } else {
          return new LearningObject(response);
        }
      })
    );
  }


  /**
   * Fetches LearningObject by cuid
   *
   * @param {string} cuid
   * @returns {Promise<LearningObject>}
   * @memberof LearningObjectService
   */
  getLearningObject(
    cuid: string,
    version?: number,
  ): Promise<LearningObject> {
    const route = LEARNING_OBJECT_ROUTES.GET_LEARNING_OBJECT(
      cuid,
      version
    );

    return this.http
      .get(route)
      .pipe(catchError(this.handleError))
      .toPromise()
      .then((res: any) => {
        const learningObject = new LearningObject(res[0]);
        return learningObject;
      });
  }

  /**
   * This function will return a subject that includes the requested Learning Objects metadata and
   * all of the requested properties.
   *
   * @param params the author, name, or id needed to retrieve the metadata for a Learning Object
   * @param properties the properties (i.e. children, parents, etc) that have been requested
   */
  getLearningObjectResources(
    params: { author?: string, cuidInfo: { cuid: string, version?: number } },
    properties?: string[]
  ) {
    try {
      const route = LEARNING_OBJECT_ROUTES.GET_LEARNING_OBJECT(params.cuidInfo.cuid, params.cuidInfo.version);

      const responses: Subject<any> = new Subject();
      const end = new Subject();

      this.http.get<LearningObject | any>(route).pipe(
        catchError(err => {
          responses.error(err);
          end.complete();
          return throwError(err);
        }),
        tap(entity => {
          if (Array.isArray(entity)) {
            if (entity.length > 1) {
              entity = entity.filter(e => e.status === LearningObject.Status.RELEASED)[0];
            } else {
              entity = entity.pop();
            }
          }

          const uris = Object.assign(entity.resourceUris);
          let completed = 0;
          Object.keys(uris).map(key => {
            if (!properties || properties.includes(key)) {
              this.fetchUri(uris[key], CALLBACKS[key]).subscribe(value => {
                responses.next({ requestKey: key, value });
                if (++completed === properties.length || completed === uris.length) {
                  responses.complete();
                  end.next();
                  end.complete();
                }
              });
            }
          });

          responses.next(new LearningObject(entity));
        }),
        takeUntil(end),
      ).subscribe();

      return responses;
    } catch (err) {
      throw err;
    }
  }

  /**
   * Function to retrieve a learning object
   *
   * @param params cuid is the current object cuid
   * @returns a learning object with specified cuid
   */
  fetchLearningObject(cuid: string, version: number): Promise<any> {
    return this.http
      .get(
        LEARNING_OBJECT_ROUTES.GET_LEARNING_OBJECT(cuid, version),
        {
          withCredentials: true,
          responseType: 'text',
        }
      )
      .pipe(catchError(this.handleError))
      .toPromise()
      .then((val) => {
        return JSON.parse(val)[0];
      });
  }

  fetchLearningObjectWithResources(
    params: { author?: string, cuidInfo: { cuid: string, version: number } },
    resources?: string[],
  ): Observable<LearningObject | HttpErrorResponse> {
    const subject = new Subject<LearningObject | HttpErrorResponse>();
    this.getLearningObjectObservable(params).pipe(
      take(1)
    ).subscribe(object => {
      // TODO: I don't think this if is ever true because
      if (object instanceof LearningObject) {
        this.fetchLearningObjectResources(object, resources).pipe(
          take(resources.length),
          finalize(() => {
            subject.next(object);
            subject.complete();
          })
        ).subscribe(resource => {
          object[resource.name] = resource.data;
        });
      } else {
        subject.next(object);
        subject.complete();
      }
    });

    return subject;
  }

  fetchLearningObjectResources(object: LearningObject, resources: string[]): Observable<{ name: string, data: any }> {
    const resourceUris: { [key: string]: string } = {};
    if (object.resourceUris !== undefined) {
      Object.keys(object.resourceUris).filter(x => resources.includes(x)).map(key => {
        resourceUris[key] = object.resourceUris[key];
      });
    } else {
      console.log('FIX ME: No resourceUris found for learning object');
    }

    return merge(...Object.entries(resourceUris).map(([name, uri]) => {
      return this.fetchUri(uri, CALLBACKS[name]).pipe(
        map(data => ({ name, data })),
        take(1)
      );
    }));
  }

  /**
   * Fetches the resource of the uri that it was given
   *
   * @param uri the uri of the learning object resource
   * @param callback
   */
  fetchUri(uri: string, callback?: Function) {
    return this.http.get(
      uri,
      { headers: this.headers, withCredentials: true }
    ).pipe(
      take(1),
      map(res => callback ? callback(res) : res),
      catchError(e => of(e))
    );
  }

  async getLearningObjectChildren(learningObjectId: string): Promise<LearningObject[]> {
    return this.http.get(
      LEARNING_OBJECT_ROUTES.GET_LEARNING_OBJECT_CHILDREN(learningObjectId),
      { headers: this.headers, withCredentials: true }
    )
    .pipe(catchError(this.handleError))
    .toPromise()
    .then((learningObjects: any[]) => {
      return learningObjects.map(learningObject => new LearningObject(learningObject));
    });
  }

  async getLearningObjectParents(learningObjectId: string): Promise<LearningObject[]> {
    return this.http.get(
      LEARNING_OBJECT_ROUTES.GET_LEARNING_OBJECT_PARENTS(learningObjectId),
      { headers: this.headers, withCredentials: true }
    )
    .pipe(catchError(this.handleError))
    .toPromise()
    .then((learningObjects: any[]) => {
      return learningObjects.map(learningObject => new LearningObject(learningObject));
    });
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
   getLearningObjectMaterials(objectId: string): Promise<any> {
    return this.http
      .get(
        LEARNING_OBJECT_ROUTES.GET_LEARNING_OBJECT_MATERIALS(objectId),
        { withCredentials: true })
      .pipe(
        catchError(this.handleError)
      )
      .toPromise();
  }

  async updateLearningObjectStatus(learningObjectId: string, status: LearningObject.Status, reason?: string): Promise<any> {
    return this.http.post(
      LEARNING_OBJECT_ROUTES.UPDATE_LEARNING_OBJECT_STATUS(learningObjectId),
      { status, reason },
      { withCredentials: true }
    )
    .pipe(
      catchError(this.handleError)
    )
    .toPromise();
  }

  /**
   * Adds children to a learning object
   *
   * @param username the username of the author
   * @param object the object having children
   * @param children the children to be had
   * @returns
   */
  async addChildren(username: string, object: any, children): Promise<any> {
    return await this.http.post(
      LEARNING_OBJECT_ROUTES.UPDATE_LEARNING_OBJECT_CHILDREN(object.id),
      {
        children
      },
      {
        withCredentials: true,
        responseType: 'text'
      }
    ).toPromise();
  }

  // TODO: The UPDATE_LEARNING_OBJECT_CHILDREN is actually an add learning object children.
  setChildren(
    learningObjectId: string,
    children: string[],
    remove: boolean,
  ): Promise<any> {
    const removeRoute = LEARNING_OBJECT_ROUTES.REMOVE_LEARNING_OBJECT_CHILD(learningObjectId);
    const addRoute = LEARNING_OBJECT_ROUTES.UPDATE_LEARNING_OBJECT_CHILDREN(learningObjectId);
    if (remove) {
      return this.http
        .patch(
          removeRoute,
          // TODO: This should remove each child that is passed in not just the first one
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

  async updateSubmittedCollection(cuid: string, collection: string) {
    await this.http.patch(
      LEARNING_OBJECT_ROUTES.UPDATE_LEARNING_OBJECT_COLLECTION(cuid),
      { collection }, { withCredentials: true, responseType: 'text' }
    ).toPromise();
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

  toggleFilesToBundle(learningObjectId: string, selected: string[], deselected: string[]) {
    return this.http.patch(
      BUNDLING_ROUTES.TOGGLE_BUNDLE_FILE({ learningObjectId }),
      {
        selected: selected,
        deselected: deselected,
      }
    );
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
