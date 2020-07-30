import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { take, map, catchError, zip, tap, mergeMap, finalize } from 'rxjs/operators';
import { of, Observable, merge, Subject } from 'rxjs';
import { LearningObject, LearningOutcome } from '@entity';
import { USER_ROUTES, PUBLIC_LEARNING_OBJECT_ROUTES } from '@env/route';

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

  constructor(private http: HttpClient) { }

  fetchLearningObject(
    params: { author?: string, cuidInfo?: { cuid: string, version?: number }, id?: string },
  ): Observable<LearningObject | HttpErrorResponse> {
    return this.http.get(this.buildRoute(params)).pipe(
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

  fetchUnassignedLearningObjects() {
    return this.http.get('http://localhost:5001/learning-objects/unassigned', { withCredentials: true }).toPromise();
  }

  discoverLearningObjectTopics() {
    return this.http.get('http://localhost:5001/topics/assign').toPromise();
  }

  fetchLearningObjectWithResources(
    params: { author?: string, cuidInfo?: { cuid: string, version?: number }, id?: string },
    resources?: string[],
    options?: { asyncDelivery?: boolean }
  ): Observable<LearningObject | any> {
    const asyncDelivery = options && options.asyncDelivery;

    if (asyncDelivery) {
      // simply merge all observables and emit their values separately
      return this.fetchLearningObject(params).pipe(
        mergeMap((object: LearningObject) => this.fetchLearningObjectResources(object, resources))
      );
    } else {
      const s = new Subject<LearningObject | HttpErrorResponse>();

      this.fetchLearningObject(params).pipe(
        take(1)
      ).subscribe(object => {
        if (object instanceof LearningObject) {
          this.fetchLearningObjectResources(object, resources).pipe(
            take(resources.length),
            finalize(() => {
              s.next(object);
              s.complete();
            })
          ).subscribe(resource => {
            object[resource.name] = resource.data;
          });
        } else {
          s.next(object);
          s.complete();
        }
      });

      return s;
    }
  }

  fetchLearningObjectResources(object: LearningObject, resources: string[] ): Observable<{ name: string, data: any }> {
    const resourceUris: { [key: string]: string } = {};
    Object.keys(object.resourceUris).filter(x => resources.includes(x)).map(key => {
      resourceUris[key] = object.resourceUris[key];
    });

    return merge(...Object.entries(resourceUris).map(([name, uri]) => {
      return this.fetchUri(uri, CALLBACKS[name]).pipe(
        map(data => ({ name, data })),
        take(1)
      );
    }));
  }

  /**
   * Fetches the resource of the uri that it was given
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

  /**
   * Returns the route that needs to be hit in order to load Learning Object based on the params passed in
   * @param params includes either the author and Learning Object name or the id to set the route needed
   * to retrieve the Learning Object
   */
  private buildRoute(params: {author?: string, cuidInfo?: { cuid: string, version?: number }, id?: string}) {
    let route;
     // Sets route to be hit based on if the id or if author and Learning Object name have been provided
     if (params.id) {
      route = USER_ROUTES.GET_LEARNING_OBJECT(params.id);
    } else if (params.author && params.cuidInfo) {
      route = PUBLIC_LEARNING_OBJECT_ROUTES.GET_PUBLIC_LEARNING_OBJECT(params.author, params.cuidInfo.cuid, params.cuidInfo.version);
    } else {
      const err = this.userError(params);
      throw err;
    }
    return route;
  }

  /**
   * Returns an error message based on the params that are missing and are needed to retrieve Learning Object
   * @param params either the author and name or the id of the Learning Object
   */
  private userError(params: {author?: string, name?: string, id?: string}) {
    if (params.author && !params.name) {
      return new Error('Cannot find Learning Object ' + params.name + 'for ' + params.author);
    } else if (params.name && !params.author) {
      return new Error('Cannot find Learning Object' + params.name + 'for ' + params.author);
    } else if (!params.author && !params.name && !params.id) {
      return new Error('Cannot find Learning Object. No identifiers found.');
    }
  }
}