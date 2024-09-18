import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LearningObject } from '@entity';
import { SEARCH_ROUTES } from './search.routes';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  constructor(private http: HttpClient) {}

  getUsersLearningObjects(
    username: string,
    query?: any,
    draftsOnly?: boolean,
  ): Promise<{ objects: LearningObject[]; total: number }> {
    return this.http
      .get(SEARCH_ROUTES.GET_USER_LEARNING_OBJECTS(username, query), {
        withCredentials: true,
      })
      .pipe(catchError(this.handleError))
      .toPromise()
      .then((val: any) => {
        return val;
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
