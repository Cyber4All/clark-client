import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { REVISION_ROUTES } from '../revisions/revisions.routes';

@Injectable({
  providedIn: 'root'
})
export class RevisionsService {

  constructor(private http: HttpClient) {}
  
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

  /**
   * Deletes a revision of a learning object. This is designed to allow an editor to create a new
   * revision when it is necessary for the editorial process to continue.
   *
   * @param username username of the author
   * @param cuid cuid of the learning object
   * @returns
   */
  deleteRevision(username: string, cuid: string, version: number) {
    return this.http
      .delete(REVISION_ROUTES.DELETE_REVISION(cuid, version), {
        withCredentials: true,
        responseType: 'text',
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
