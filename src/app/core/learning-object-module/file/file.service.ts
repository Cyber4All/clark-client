import { Injectable } from '@angular/core';
import { FILE_ROUTES } from './file.routes';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class FileService {
  private headers = new HttpHeaders();

  constructor(
    private http: HttpClient,
    private cookies: CookieService
  ) { 
    const token = this.cookies.get('presence');
    if (token) {
      this.headers = new HttpHeaders().append('Authorization',`Bearer ${token}`);
    }
  }

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

  /**
   * Makes a request to the previewUrl with authorization headers to get the file
   * and returns the blob url of the file that can be opened in a new tab
   * 
   * @param url the previewUrl of the material on the learning object
   * @returns the blob url of the file
   */
  async previewLearningObjectFile(url: string): Promise<string> {
    return fetch(url, {
        headers: {
          Authorization: this.headers.get('Authorization')
        }
      })
      .then((response) => response.blob())
      .then((blob) => window.URL.createObjectURL(blob));
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
