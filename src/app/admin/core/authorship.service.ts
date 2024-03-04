import { Injectable } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { throwError } from 'rxjs';
import { User } from '@entity';
import { CHANGE_AUTHORSHIP_ROUTES } from '../../core/learning-object-module/change-authorship/change-authorship.routes';

@Injectable({
  providedIn: 'root'
})
export class AuthorshipService {

  private headers = new HttpHeaders();

  constructor(private http: HttpClient) { }

  async changeAuthorship(oldAuthor: User, id: string, newAuthor: string) {
    return this.http
      .post(CHANGE_AUTHORSHIP_ROUTES.CHANGE_AUTHORSHIP(oldAuthor.id, id),
        {
          'author': newAuthor,
        },
        { withCredentials: true, responseType: 'text' }
      )
      .pipe(

        catchError(this.handleError)
      )
      .toPromise();
  }

  /**
   * Generic error-handling function for errors through from the HttpClient module
   *
   * @private
   * @param {HttpErrorResponse} error
   * @returns
   * @memberof AuthorshipService
   */
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
