import { HttpClient, HttpErrorResponse, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BUNDLING_ROUTES } from './bundling.routes';
import { catchError, timeout } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { LearningObject } from 'entity/learning-object/learning-object';

const DEFAULT_BUNDLE_NAME = 'CLARK_LEARNING_OBJECT.zip';
@Injectable({
  providedIn: 'root'
})
export class BundlingService {

  showDownloadModal = false;
  downloading = [];
  currentIndex = null;

  private headers = new HttpHeaders();

  constructor(
    private http: HttpClient,
  ) { }

  async bundleLearningObject(learningObjectId: string): Promise<void> {
    this.http
      .post(BUNDLING_ROUTES.BUNDLE_LEARNING_OBJECT(learningObjectId),
        {},
        {
          headers: this.headers,
          withCredentials: true,
        }
      )
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

  /**
    * Method to start bundle stream and download the zip file
    * @param url request to api for zip in stream
    * @returns void - blob stream is downloaded to user's machine
    */
  async downloadBundle(url: string): Promise<void> {
    return this.http.get(
      url, {
      responseType: 'blob',
      observe: 'response',
      headers: this.headers,
      withCredentials: true,
    })
      .pipe(
        timeout(30000), // 30 seconds timeout
        catchError(error => {
          throw this.handleError(error);
        })
      )
      .toPromise()
      .then((response: HttpResponse<Blob>) => {
        // Get the content disposition header from the response
        const contentDisposition = response.headers.get('content-disposition');
        // Get the blob from the response
        const blob = response.body;
        // Validate that the blob is not empty
        if (!blob) {
          throw this.handleError(new HttpErrorResponse({ error: 'No content in response body', status: 500 }));
        }
        // Create an element on the DOM to download the zip file
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        // REQUIRED: Set the download attribute to the name of the file
        link.download = this.getBundleName(contentDisposition);
        document.body.appendChild(link);
        // Trigger the download
        link.click();
        // Remove the element from the DOM
        document.body.removeChild(link);
        // Revoke the object URL to prevent memory leaks
        window.URL.revokeObjectURL(link.href);
      });
  }

  /**
     * Method to extract the bundle name from the content disposition header
     * @param contentDisposition content disposition header
     * @attribute filename standard attribute for content disposition header
     * @returns name of the bundle zip file
     */
  private getBundleName(contentDisposition: string): string {
    // If no content disposition header, return default name
    if (!contentDisposition) {
      return DEFAULT_BUNDLE_NAME;
    }
    // Split the content disposition header by semicolon
    const split = contentDisposition.split(';');
    for (const part of split) {
      const [key, value] = part.trim().split('=');
      // Match only the filename key
      if (key === 'filename') {
        return value.replace(/"/g, '').trim();
      }
    }
    // Return default bundle name if no filename key found
    return DEFAULT_BUNDLE_NAME;
  }

  /**
 * Function to download the learning object zip file
 *
 * @param learningObjectId the unique mongo id of a learning object
 */
  download(learningObjectId: string) {
    this.toggleDownloadModal(true);
    this.downloadBundle(BUNDLING_ROUTES.DOWNLOAD_BUNDLE(learningObjectId));
  }
  toggleDownloadModal(val?: boolean) {
    this.showDownloadModal = val;
  }

  downloadObject(event: MouseEvent, object: LearningObject, index: number) {
    event.stopPropagation();
    this.currentIndex = index;
    this.downloading[index] = true;
    this.showDownloadModal = true;
    this.downloadBundle(BUNDLING_ROUTES.DOWNLOAD_BUNDLE(object.id));
    this.downloading[index] = false;
  }
}
