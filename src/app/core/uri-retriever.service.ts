import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, Subject } from 'rxjs';
import { LearningObject } from '@entity';
import { USER_ROUTES, PUBLIC_LEARNING_OBJECT_ROUTES } from '@env/route';
import { LearningOutcome } from '@entity';
import { catchError, retry, map, tap, filter, take, takeUntil, finalize } from 'rxjs/operators';

const CALLBACKS = {
  outcomes: (outcomes: any[]) => {
    return outcomes.map(o => new LearningOutcome(o));
  }
};
@Injectable({
  providedIn: 'root'
})
export class UriRetrieverService {

  constructor(private http: HttpClient) { }

  /**
   * This function will return the metadata and the requested resources for a learning object as a promise of a Learning Object.
   * @params params{ author: string, name: string, id:string } the values needed to retrieve the metadata for a Learning Object
   * @params resources (i.e. children, parents, outcomes, etc) that need to be loaded with the metadata
   */
  getLearningObject(
    params: { author?: string, name?: string, id?: string },
    resources?: string[]
  ): Observable<LearningObject> {
    try {
      // fill the properties array with either the content of the resources array if it is passed in or set it to empty
      let properties: string[];
      if (resources) {
        properties = resources;
      } else {
        properties = [];
      }



      const request = this.getLearningObjectResources(params, properties);

      return this.getFullLearningObject(request, resources);
    } catch (err) {
      throw err;
    }
  }

  /**
   * This function will return a subject that includes the requested Learning Objects metadata and
   * all of the requested properties.
   * @param params the author, name, or id needed to retrieve the metadata for a Learning Object
   * @param properties the properties (i.e. children, parents, etc) that have been requested
   */
  getLearningObjectResources(
    params: { author?: string, name?: string, id?: string },
    properties?: string[]
  ) {
    try {
      const route = this.setRoute(params);

      const responses: Subject<any> = new Subject();
      const end = new Subject();

      this.http.get<LearningObject>(route).pipe(
        retry(3),
        tap(entity => {
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
        catchError(this.handleError),
      ).subscribe();

      return responses;
    } catch (err) {
      throw err;
    }
  }


  //////////////////////////
  // INDIVIDUAL RESOURCES //
  /////////////////////////

  /**
   * Retrieves the Learning Object metadata
   * @params author is the username of the author
   * @params learningObjectName is the name of the learning object
   */
  getLearningObjectSummary(author: string, learningObjectName: string): Observable<any> {
    return this.http.get<LearningObject>(
      PUBLIC_LEARNING_OBJECT_ROUTES.GET_PUBLIC_LEARNING_OBJECT(
        author, learningObjectName
        ))
        .pipe(
          retry(3),
          catchError(this.handleError)
        );
  }

  /**
   * Retrieves the Learning Object outcomes
   * @param uri this is the uri that should be hit to get the objects outcomes
   */
  getLearningObjectOutcomes(uri: string): Observable<LearningOutcome[]> {
    return this.http.get<LearningOutcome[]>(uri).pipe(retry(3), catchError(this.handleError));
  }

  /**
   * Retrieves the Learning Object children
   * @param uri this is the uri that should be hit to get the objects children
   */
  getLearningObjectChildren(params: {uri: string, unreleased?: boolean}): Observable<LearningObject[]> {
    if (params.unreleased) {
      return this.http.get<LearningObject[]>(params.uri, { withCredentials: true })
      .pipe(
        retry(3),
        catchError(this.handleError),
        take(1),
        /* TODO: Remove this.
         * It is a stopcap until the service stops returning unreleased.
         * More info at https://github.com/Cyber4All/learning-object-service/pull/282
         */
        map(children => children.filter(child => child.status !== 'unreleased')),
      );
    } else {
      return this.http.get<LearningObject[]>(params.uri, { withCredentials: true })
      .pipe(
        retry(3),
        catchError(this.handleError),
        take(1)
      );
    }
  }

  /**
   * Retrieves the Learning Object materials
   * @param uri this is the uri that hsould be hit to get the objects materials
   */
  getLearningObjectMaterials(uri: string): Observable<any> {
    return this.http.get(uri, { withCredentials: true })
    .pipe(
      retry(3),
      catchError(this.handleError)
    );
  }

  /**
   * Retrieves the Learning Object metrics
   * @param uri this is the uri that should be hit to get the object's metrics
   */
  getLearningObjectMetrics(uri: string): Observable<any> {
    return this.http.get<any>(uri).pipe(retry(3), catchError(this.handleError));
  }

  /**
   * Retrieves the Learning Object parents
   * @param uri this is the uri that should be hit to get the object's parents
   * @param unreleased this is the boolean that filters learning object parents by everything (including released)
   */
  getLearningObjectParents(params: {uri: string, unreleased?: boolean}): Observable<LearningObject[]> {
    if (params.unreleased === true) {
      return this.http.get<LearningObject[]>(params.uri, { withCredentials: true})
      .pipe(
        retry(3),
        catchError(this.handleError),
        take(1)
      );
    } else {
      return this.http.get<LearningObject[]>(params.uri, { withCredentials: true})
      .pipe(
        retry(3),
        catchError(this.handleError),
        take(1),
        /* TODO: Remove this.
         * It is a stopcap until the service stops returning unreleased.
         * More info at https://github.com/Cyber4All/learning-object-service/pull/282
         */
        map(parents => parents.filter(parent => parent.status !== 'unreleased')),
      );
    }
  }

  /**
   * Retrieves the Learning Object ratings
   * @param uri this is the uri that should be hit to get the object's ratings
   */
  getLearningObjectRatings(uri: string): Observable<any> {
    return this.http
    .get(uri, { withCredentials: true })
    .pipe(
      retry(3),
      catchError(this.handleError),
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

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // Client-side or network returned error
      return throwError(error.error.message);
    } else {
      // API returned error
      return throwError(error);
    }
  }


  //////////////////////
  // HELPER FUNCTIONS///
  //////////////////////

  /**
   * Fetches the resource of the uri that it was given
   * @param uri the uri of the learning object resource
   * @param callback
   */
  private fetchUri(uri: string, callback?: Function) {
    return this.http.get(uri).pipe(
      take(1),
      map(res => callback ? callback(res) : res)
    );
  }

  /**
   * Packages a full Learning Object with all the resources that were requested
   * @params request the resources for the Learning Object (i.e children, parents, outcomes, etc.)
   */
  private getFullLearningObject(request: any, resources?: any[]): Observable<LearningObject> {
    const payload = new Subject<LearningObject>();
    const learningObject = {};

    request.pipe(
      take(resources ? resources.length + 1 : 1),
      finalize(() => payload.next(learningObject as LearningObject))
    ).subscribe(val => {
      if (val.requestKey) {
        learningObject[val.requestKey] = val.value;
      } else {
        const object = (val as LearningObject).toPlainObject();

        // tslint:disable-next-line: forin
        for (const key in object) {
          learningObject[key] = object[key];
        }
      }
    });

    return payload.pipe(take(1));
  }

  /**
   * Returns the route that needs to be hit in order to load Learning Object based on the params passed in
   * @param params includes either the author and Learning Object name or the id to set the route needed
   * to retrieve the Learning Object
   */
  private setRoute(params: {author?: string, name?: string, id?: string}) {
    let route;
     // Sets route to be hit based on if the id or if author and Learning Object name have been provided
     if (params.id) {
      route = USER_ROUTES.GET_LEARNING_OBJECT(params.id);
    } else if (params.author && params.name) {
      route = PUBLIC_LEARNING_OBJECT_ROUTES.GET_PUBLIC_LEARNING_OBJECT(params.author, params.name);
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
