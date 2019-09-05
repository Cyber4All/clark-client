import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError  } from 'rxjs';
import { LearningObject, StandardOutcome } from '@entity';
import { PUBLIC_LEARNING_OBJECT_ROUTES } from '@env/route';
import { catchError, retry } from 'rxjs/operators';
@Injectable({
  providedIn: 'root'
})
export class UriRetrieverService {

  constructor(private http: HttpClient) { }

  getLearningObject(author: string, learningObjectName: string, options?: string[]) {
    this.getLearningObjectMeta(author, learningObjectName).then(val => {
      console.log(val);
      return options;
    });
  }
  /**
   * Retrieves the Learning Object Metadata
   */
  getLearningObjectMeta(author: string, learningObjectName: string): Promise<LearningObject> {
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
    return null;
  }
  /**
   * @param uri this is the uri that should be hit to get the objects children
   */
  getLearningObjectChildren(uri: string): Observable<any> {
    return null;
  }
  /**
   *
   * @param uri this is the uri that hsould be hit to get the objects materials
   */
  getLearningObjectMaterials(uri: string): Observable<any> {
    return null;
  }

  /**
   * @param uri this is the uri that should be hit to get the object's metrics
   */
  getLearningObjectMetrics(uri: string): Observable<any> {
    return null;
  }

  /**
   * @param uri this is the uri that should be hit to get the object's parents
   */
  getLearningObjectParents(uri: string): Observable<any> {
    return null;
  }

  /**
   * @param uri this is the uri that should be hit to get the object's ratings
   */
  getLearningObjectRatings(uri: string): Observable<any> {
    return null;
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
