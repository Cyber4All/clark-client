import { Injectable } from '@angular/core';
import { FILE_ROUTES } from './file.routes';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FileService {
  private headers = new HttpHeaders();


  constructor(
    private http: HttpClient,
  ) { }

  // TODO: Upload should be moved from the file mnager to this file

  async deleteLearningObjectFileMetadata(learningObjectId: string, fileId: string): Promise<void> {
    this.http
      .delete(FILE_ROUTES.DELETE_FILE({
        learningObjectId: learningObjectId,
        fileId: fileId
      }), {
        headers: this.headers,
        withCredentials: true,
      })
      .pipe(catchError(this.handleError))
      .toPromise();
  }

  private handleError(error: HttpErrorResponse) {
    if (
      error.error instanceof ErrorEvent ||
      (error.error && error.error.message)
    ) {
      // Client-side or network returned error
      return throwError(error.error.message);
    } else {
      // API returned error
      return throwError(error);
    }
  }
}
