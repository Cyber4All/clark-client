import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { PUBLIC_LEARNING_OBJECT_ROUTES, USER_ROUTES } from '@env/route';
import { AuthService } from '../auth-module/auth.service';
import { throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';

@Injectable()
export class ProfileService {
  userNotifications: any;
  constructor(private http: HttpClient, private auth: AuthService) { }

  /**
   * Function to retrieve a learning object
   *
   * @param params author is undefined - cuid is the current object cuid
   * @returns a learning object with specified cuid
   */
  fetchLearningObject(params: { author: string; cuid: string }): Promise<any> {
    return this.http
      .get(
        PUBLIC_LEARNING_OBJECT_ROUTES.GET_PUBLIC_LEARNING_OBJECT(
          params.author,
          params.cuid
        ),
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

  /**
   * Service call to retrieve collection meta data for all objects for a particular user
   *
   * @param username username of the user's profile being accessed
   * @returns {cuid: string, version: int, status: string, collection: string} object metadata
   * for each collection an object belongs to for a user
   */
  getCollectionData(username: string): Promise<any> {
    return this.http
      .get(USER_ROUTES.GET_COLLECTIONS(username), {
        withCredentials: true,
      })
      .pipe(catchError(this.handleError))
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
