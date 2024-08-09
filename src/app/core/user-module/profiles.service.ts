import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../auth-module/auth.service';
import { LEARNING_OBJECT_ROUTES } from '../learning-object-module/learning-object/learning-object.routes';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  userNotifications: any;
  constructor(private http: HttpClient, private auth: AuthService) { }

  /**
   * Function to retrieve a learning object
   *
   * @param params cuid is the current object cuid
   * @returns a learning object with specified cuid
   */
  fetchLearningObject(params: { cuid: string }): Promise<any> {
    return this.http
      .get(
        LEARNING_OBJECT_ROUTES.GET_PUBLIC_LEARNING_OBJECT(
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
