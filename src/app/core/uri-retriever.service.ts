import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError  } from 'rxjs';
import { LearningObject, StandardOutcome } from '@entity';
import { PUBLIC_LEARNING_OBJECT_ROUTES } from '@env/route';
import { catchError, retry, map, filter, take } from 'rxjs/operators';
@Injectable({
  providedIn: 'root'
})
export class UriRetrieverService {

  constructor(private http: HttpClient) { }

  async getLearningObject(author: string, learningObjectName: string, options?: string[]): Promise<LearningObject> {
    const learningObject = await this.getLearningObjectMeta(author, learningObjectName);
    if (options.includes('outcomes')) {
      this.getLearningObjectOutcomes(learningObject.resourceUris.outcomes).toPromise().then(val => {
        learningObject.outcomes = val;
      });
    }
    if (options.includes('children')) {
      this.getLearningObjectChildren(learningObject.resourceUris.children).toPromise().then(val => {
        learningObject.children = val;
      });
    }
    if (options.includes('materials')) {
      this.getLearningObjectMaterials(learningObject.resourceUris.materials).toPromise().then(val => {
        learningObject.materials = val;
      });
    }
    if (options.includes('metrics')) {
      this.getLearningObjectMetrics(learningObject.resourceUris.metrics).toPromise().then(val => {
        learningObject.metrics = val;
      });
    }
    if (options.includes('parents')) {
      this.getLearningObjectParents(learningObject.resourceUris.parents).toPromise().then(val => {
        learningObject.parents = val;
      });
    }
    if (options.includes('ratings')) {
      this.getLearningObjectRatings(learningObject.resourceUris.ratings).toPromise().then(val => {
        learningObject.ratings = val;
      });
    }
    return learningObject;
  }
  /**
   * Retrieves the Learning Object Metadata
   * @params author is the username of the author
   * @params learningObjectName is the name of the learning object
   */
  getLearningObjectMeta(author: string, learningObjectName: string): Promise<any> {
    return this.http.get<LearningObject>(
      PUBLIC_LEARNING_OBJECT_ROUTES.GET_PUBLIC_LEARNING_OBJECT(
        author, learningObjectName
        ))
        .pipe(
          retry(3),
          catchError(this.handleError)
        )
        .toPromise();
  }
  /**
   * @param uri this is the uri that should be hit to get the objects outcomes
   */
  getLearningObjectOutcomes(uri: string): Observable<any> {
    return this.http.get(uri).pipe(retry(3), catchError(this.handleError));
  }
  /**
   * @param uri this is the uri that should be hit to get the objects children
   */
  getLearningObjectChildren(uri: string): Observable<LearningObject[]> {
    return this.http.get<LearningObject[]>(uri, { withCredentials: true })
    .pipe(
      retry(3),
      catchError(this.handleError),
      take(1)
    );
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
  getLearningObjectParents(uri: string, unreleased?: boolean): Observable<any> {
    if (unreleased === true) {
      return this.http.get<LearningObject[]>(uri, { withCredentials: true})
      .pipe(
        retry(3),
        catchError(this.handleError),
        take(1)
      );
    } else {
      return this.http.get<LearningObject[]>(uri, { withCredentials: true})
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
