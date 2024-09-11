import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LearningObject } from '@entity';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {
  LEARNING_OBJECT_ROUTES,
  LEGACY_USER_ROUTES
} from '../core/learning-object-module/learning-object/learning-object.routes';
import { REVISION_ROUTES } from '../core/learning-object-module/revisions/revisions.routes';
import { USER_ROUTE } from '../core/user-module/user.routes';

// TODO: move to core module
@Injectable({
  providedIn: 'root',
})
export class LearningObjectService {
  filteredResults;
  dataObserver;
  data;

  constructor(private http: HttpClient) {}

  observeFiltered(): Observable<LearningObject[]> {
    return this.data;
  }

  getFilteredObjects() {
    return this.filteredResults;
  }

  clearSearch() {
    this.filteredResults = [];
  }

  openLearningObject(url: string) {
    window.open(url);
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
    const route = LEARNING_OBJECT_ROUTES.GET_PUBLIC_LEARNING_OBJECT(
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
   * Fetches LearningObject by id
   *
   * @param {string} id
   * @returns {Promise<LearningObject>}
   * @memberof LearningObjectService
   */
  getRevisedLearningObject(learningObjectId: String): Promise<LearningObject> {
    const route = LEGACY_USER_ROUTES.GET_LEARNING_OBJECT(learningObjectId);
    return this.http
      .get(route)
      .pipe(catchError(this.handleError))
      .toPromise()
      .then((res: any) => {
        const learningObject = new LearningObject(res);
        return learningObject;
      });
  }
  getUsersLearningObjects(username: string): Promise<LearningObject[]> {
    return this.http
      .get(USER_ROUTE.GET_USER(username), { withCredentials: true })
      .pipe(catchError(this.handleError))
      .toPromise()
      .then((val: any) => {
        return val.map((l) => new LearningObject(l));
      });
  }

  /**
   * Creates a Revision of an existing learning object
   *
   * @param cuid the CUID of the learning object to create a revision of
   */
  async createRevision(cuid: string): Promise<any> {
    const route = REVISION_ROUTES.CREATE_REVISION(cuid);
    const response = await this.http
      .post(route, {}, { withCredentials: true })
      .pipe(catchError(this.handleError))
      .toPromise();
    return response;
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
