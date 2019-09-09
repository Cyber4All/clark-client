import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, Subject } from 'rxjs';
import { LearningObject } from '@entity';
import { USER_ROUTES, PUBLIC_LEARNING_OBJECT_ROUTES } from '@env/route';
import { LearningOutcome } from '@entity';
import { catchError, retry, map, tap, filter, take, takeUntil, finalize } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UriRetrieverService {

  constructor(private http: HttpClient) { }

  /**
   * Gets learning object based on resources
   */
  async getLearningObject(
    params: { author?: string, name?: string, id?: string },
    resources?: string[]
  ): Promise<LearningObject> {
    let properties: string[];
    if (resources) {
      properties = resources;
    } else {
      properties = ['children', 'metrics', 'materials', 'outcomes', 'parents', 'ratings'];
    }

    const learningObject = {};
    const request = this.getLearningObjectResources(params, properties);

    return new Promise((resolve) => {
      request.pipe(
        finalize(() => resolve(learningObject as LearningObject))
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
    });
  }

  getLearningObjectResources(
    params: { author?: string, name?: string, id?: string },
    properties?: string[]
  ) {
    let route;

    if (params.id) {
      route = USER_ROUTES.GET_LEARNING_OBJECT(params.id);
    } else {
      route = PUBLIC_LEARNING_OBJECT_ROUTES.GET_PUBLIC_LEARNING_OBJECT(params.author, params.name);
    }

    const responses: Subject<any> = new Subject();
    const end = new Subject();

    this.http.get<LearningObject>(route).pipe(
      retry(3),
      tap(entity => {
        const uris = Object.assign(entity.resourceUris);

        let completed = 0;

        Object.keys(uris).map(key => {
          if (!properties || properties.includes(key)) {
            this.fetchUri(uris[key]).subscribe(value => {
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
  }

  private fetchUri(uri: string, callback?: Function) {
    return this.http.get(uri).pipe(
      take(1),
      map(res => callback ? callback(res) : res)
    );
  }

  /**
   * Retrieves the Learning Object Metadata
   * @params author is the username of the author
   * @params learningObjectName is the name of the learning object
   */
  getLearningObjectMeta(author: string, learningObjectName: string): Observable<any> {
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
   * @param uri this is the uri that should be hit to get the objects outcomes
   */
  getLearningObjectOutcomes(uri: string): Observable<LearningOutcome[]> {
    return this.http.get<LearningOutcome[]>(uri).pipe(retry(3), catchError(this.handleError));
  }
  /**
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
   *
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
   * @param uri this is the uri that should be hit to get the object's metrics
   */
  getLearningObjectMetrics(uri: string): Observable<any> {
    return this.http.get<any>(uri).pipe(retry(3), catchError(this.handleError));
  }

  /**
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
}
