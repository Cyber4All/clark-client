import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { throwError } from 'rxjs';
import { REVISION_ROUTES } from './revisions/revisions.routes';
import { catchError } from 'rxjs/operators';
import { EDITORIAL_ROUTES } from './editorial.routes';

@Injectable({
  providedIn: 'root',
})
export class EditorialService {
  httpHeaders = new HttpHeaders();

  constructor(private http: HttpClient) {}

  /**
   * Creates a Revision of an existing learning object
   *
   * @param cuid the CUID of the learning object to create a revision of
   */
  async createRevision(cuid: string): Promise<any> {
    const route = EDITORIAL_ROUTES.CREATE_REVISION(cuid);
    const response = await this.http
      .post(route, {}, { headers: this.httpHeaders, withCredentials: true })
      .pipe(catchError(this.handleError))
      .toPromise();
    return response;
  }

  /**
   * Deletes a revision of a learning object. This is designed to allow an editor to create a new
   * revision when it is necessary for the editorial process to continue.
   *
   * @param cuid cuid of the learning object
   * @returns
   */
  deleteRevision(cuid: string, version: number) {
    return this.http
      .delete(EDITORIAL_ROUTES.DELETE_REVISION(cuid, version), {
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
