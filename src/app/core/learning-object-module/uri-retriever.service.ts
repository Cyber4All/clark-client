import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LearningObject, LearningOutcome } from '@entity';
import { Observable, Subject, of, throwError } from 'rxjs';
import { catchError, filter, finalize, map, take } from 'rxjs/operators';
import { LearningObjectService } from './learning-object/learning-object.service';
import { LEARNING_OBJECT_ROUTES } from '../learning-object-module/learning-object/learning-object.routes';
import { SEARCH_ROUTES } from './search/search.routes';

// TODO this service should be deleted and its instances should be replced with the LearningObjectService in core

// TODO add callbacks for children and ratings
export const CALLBACKS = {
  outcomes: (outcomes: any[]) => {
    return outcomes.map(o => new LearningOutcome(o));
  }
};

@Injectable({
  providedIn: 'root'
})
export class UriRetrieverService {

  constructor(
    private http: HttpClient,
    private learningObjectService: LearningObjectService
  ) { }

  /**
   * This function will return the metadata and the requested resources for a learning object as a promise of a Learning Object.
   *
   * @params params{ author: string, name: string, id:string } the values needed to retrieve the metadata for a Learning Object
   * @params resources (i.e. children, parents, outcomes, etc) that need to be loaded with the metadata
   */
  getLearningObject(
    params: { author?: string, cuidInfo: { cuid: string, version?: number }, id?: string },
    resources?: string[]
  ): Observable<LearningObject> {
    try {
      const request = this.learningObjectService.getLearningObjectResources(params, resources || []);
      return this.getFullLearningObject(request, resources);
    } catch (err) {
      throw err;
    }
  }


  //////////////////////////
  // INDIVIDUAL RESOURCES //
  /////////////////////////

  /** TODO remove this
   * Retrieves the Learning Object children
   *
   * @param uri this is the uri that should be hit to get the objects children
   */
  getLearningObjectChildren(params: { uri: string, unreleased?: boolean }): Observable<LearningObject[]> {
    if (params.unreleased) {
      return this.http.get<LearningObject[]>(params.uri, { withCredentials: true })
        .pipe(

          take(1),
        );
    } else {
      return this.http.get<LearningObject[]>(params.uri, { withCredentials: true })
        .pipe(

          take(1)
        );
    }
  }

  /** TODO remove this
   * Retrieves the Learning Object ratings
   *
   * @param uri this is the uri that should be hit to get the object's ratings
   */
  getLearningObjectRatings(uri: string): Observable<any> {
    return this.http
      .get(uri, { withCredentials: true })
      .pipe(

        filter(response => response != null),
        map((response: any) => {
          const ratings = response.ratings.map((r: any) => {
            const x = ({ ...r, id: r.id ? r.id : r._id });
            delete x._id;
            return x;
          });
          return { ...response, ratings };
        })
      );
  }

  /**
   * Fetches the resource of the uri that it was given
   *
   * @param uri the uri of the learning object resource
   * @param callback
   */
  fetchUri(uri: string, callback?: Function) {
    return this.http.get(uri).pipe(
      take(1),
      map(res => callback ? callback(res) : res),
      catchError(_ => of(undefined))
    );
  }


  //////////////////////
  // HELPER FUNCTIONS///
  //////////////////////

  /**
   * Packages a full Learning Object with all the resources that were requested
   *
   * @params request the resources for the Learning Object (i.e children, parents, outcomes, etc.)
   */
  private getFullLearningObject(request: any, resources?: any[]): Observable<LearningObject> {
    const payload = new Subject<LearningObject>();
    const learningObject = {};

    request.pipe(
      take(resources ? resources.length + 1 : 1),
      finalize(() => payload.next(learningObject as LearningObject)),
      catchError(err => {
        payload.error(err);
        return throwError(err);
      })
    ).subscribe(val => {
      if (val.requestKey) {
        learningObject[val.requestKey] = val.value;
      } else {
        const object = (val as LearningObject).toPlainObject();

        // eslint-disable-next-line guard-for-in
        for (const key in object) {
          learningObject[key] = object[key];
        }
      }
    });

    return payload.pipe(take(1), map(o => new LearningObject(o)));
  }

  /**
   * Returns the route that needs to be hit in order to load Learning Object based on the params passed in
   *
   * @param params includes either the author and Learning Object name or the id to set the route needed
   * to retrieve the Learning Object
   */
  private setRoute(params: { cuidInfo?: { cuid: string, version?: number }, learningObjectId?: string }) {
    let route;
    // Sets route to be hit based on if the id or if Learning Object name have been provided
    if (params.cuidInfo?.cuid) {
      route = LEARNING_OBJECT_ROUTES.GET_LEARNING_OBJECT(params.cuidInfo.cuid, params.cuidInfo.version);
    } else {
      const err = this.userError(params);
      throw err;
    }
    return route;
  }

  /**
   * Returns an error message based on the params that are missing and are needed to retrieve Learning Object
   *
   * @param params either the author and name or the id of the Learning Object
   */
  private userError(params: { author?: string, name?: string, learningObjectId?: string }) {
    if (params.author && !params.name) {
      return new Error('Cannot find Learning Object ' + params.name + 'for ' + params.author);
    } else if (params.name && !params.author) {
      return new Error('Cannot find Learning Object' + params.name + 'for ' + params.author);
    } else if (!params.author && !params.name && !params.learningObjectId) {
      return new Error('Cannot find Learning Object. No identifiers found.');
    }
  }

}
