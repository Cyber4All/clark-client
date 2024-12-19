import { Injectable, Input } from '@angular/core';
import { FILE_MANAGER_ROUTES, FILE_METADATA_ROUTES } from './file.routes';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { catchError, take, takeUntil } from 'rxjs/operators';
import { Observable, Subject, throwError } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { FileUploadMeta } from 'app/onion/learning-object-builder/components/content-upload/app/services/typings';
import { LearningObject } from '@entity';

@Injectable({
  providedIn: 'root'
})
export class FileService {
  private headers = new HttpHeaders();

  @Input()
  learningObject$: Observable<LearningObject> =
    new Observable<LearningObject>();

  constructor(
    private http: HttpClient,
  ) {
  }

  // TODO: Upload should be moved from the file mnager to this file

  async deleteLearningObjectFileMetadata(learningObjectId: string, fileId: string): Promise<void> {
    this.http
      .delete(FILE_METADATA_ROUTES.DELETE_LEARNING_OBJECT_FILE_METADATA(learningObjectId, fileId), {
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
    return this.http.get(url, {
        withCredentials: true,
        responseType: 'blob',
        observe: 'response'
      })
      .pipe(catchError(this.handleError))
      .toPromise()
      .then((response: any) => {
        // Extract the blob from the response
        const blob = response.body;

        // Extract the filename from the Content-Disposition header
        const contentDisposition = response.headers.get('Content-Disposition');
        console.log('Content ', contentDisposition);
        const filename = contentDisposition?.match(/filename="?([^"]+)"?/)?.[1] || 'downloaded_file';

        // Create a URL for the blob
        const blobUrl = window.URL.createObjectURL(blob);

        // Trigger a download using an anchor element
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = filename; // Use the extracted filename
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        // Revoke the blob URL to free memory
        window.URL.revokeObjectURL(blobUrl);
        return '';
    });
  }

  /**
   * Makes request to update file description
   *
   * @param {string} authorUsername
   * @param {string} objectId
   * @param {string} fileId
   * @param {string} description
   * @returns {Promise<any>}
   * @memberof LearningObjectService
   */
  updateFileDescription(
    objectId: string,
    fileId: string,
    description: string
  ): Promise<any> {
    const route = FILE_METADATA_ROUTES.UPDATE_LEARNING_OBJECT_FILE_METADATA(
      objectId,
      fileId
    );
    return this.http
      .patch(
        route,
        { description },
        { headers: this.headers, withCredentials: true, responseType: 'text' }
      )
      .pipe(

        catchError(this.handleError)
      )
      .toPromise();
  }

  // Updates the README of a learning object
  async updateReadme(id: string): Promise<any> {
    return await this.http.patch(
      FILE_MANAGER_ROUTES.UPDATE_README(id),
      {},
      {
        headers: this.headers,
        withCredentials: true,
        responseType: 'text'
      }
    )
      .pipe(

        catchError(this.handleError)
      ).toPromise();
  }

  /**
   * Adds file meta to a Learning Object's materials
   * Adding files are handled by a job queue to avoid sending too large of a payload to the server
   *
   * @param {string} authorUsername [The Learning Object's author's username]
   * @param {string} objectId [The Id of the Learning Object]
   * @param {FileUploadMeta[]} files [List of file meta to be added]
   * @returns {Promise<string[]>}
   * @memberof LearningObjectService
   */
  addFileMeta({
    objectId,
    files
  }: {
      objectId: string;
      files: FileUploadMeta[];
    }): Promise<string[]> {
      const route = FILE_METADATA_ROUTES.ADD_LEARNING_OBJECT_FILE_METADATA(objectId);
    const MAX_PER_REQUEST = 100;
    const responses$: Promise<string[]>[] = [];
    const completed$: Subject<boolean> = new Subject<boolean>();
    const sendNextBatch$: Subject<void> = new Subject<void>();

    const response = new Promise<string[]>((resolve, reject) => {
      sendNextBatch$.pipe(takeUntil(completed$)).subscribe(() => {
        const batch = files.splice(0, MAX_PER_REQUEST);
        if (batch.length) {
          this.handleFileMetaBatch(route, batch, responses$, sendNextBatch$);
        } else {
          this.handleFileMetaRequestQueueCompletion(completed$, responses$)
            .then(resolve)
            .catch(reject);
        }
      });
    });
    sendNextBatch$.next();
    return response;
  }

  /**
   * Calls LO service to update the packageable status of toggled files
   *
   * @param learningObjectID The current learning object's ID
   * @param fileIDs An array of file IDs that need to be updated
   * @param state The new packageable property to update to
   * @returns A promise
   */
  // TODO: Move to bundling service
  toggleBundle(
    learningObjectId: string,
    fileIDs: string[],
    state: boolean
  ) {
    return this.http
      .patch(
        FILE_MANAGER_ROUTES.UPDATE_BUNDLE(learningObjectId),
        {
          fileIDs: fileIDs,
          packagable: state
        },
        { headers: this.headers, withCredentials: true }
      )
      .pipe(

        catchError(this.handleError)
      )
      .toPromise();
  }

  /**
   * Handles making request to upload batch of file meta
   *
   * @private
   * @param {string} route [Route to make request to]
   * @param {FileUploadMeta[]} batch [Batch of file meta to be added]
   * @param {Promise<string[]>[]} responses$ [List of response promises to append to]
   * @param {Subject<void>} sendNextBatch$ [Observable used to signal that the next batch should be sent]
   * @memberof LearningObjectService
   */
  private handleFileMetaBatch(
    route: string,
    batch: FileUploadMeta[],
    responses$: Promise<string[]>[],
    sendNextBatch$: Subject<void>
  ) {
    const response$ = this.http
      .post(route,
        { fileMeta: batch },
        {
          headers: this.headers,
          withCredentials: true
        })
      .pipe(
        catchError(this.handleError)
      )
      .toPromise()
      .then((res: { fileMetaId: string[] }) => res.fileMetaId);
    responses$.push(response$);
    sendNextBatch$.next();
  }

  /**
   * Handles completion of requests for all file metadata that was enqueued
   *
   * @private
   * @param {Subject<boolean>} completed$ [Observable used to signal that all batches have been completed]
   * @param {Promise<string[]>[]} responses$ [List of response promises to resolve]
   * @returns
   * @memberof LearningObjectService
   */
  private async handleFileMetaRequestQueueCompletion(
    completed$: Subject<boolean>,
    responses$: Promise<string[]>[]
  ): Promise<string[]> {
      completed$.next(true);
      completed$.unsubscribe();
      const fileIdsArrays = await Promise.all(responses$);
      const fileIds = flattenDeep(fileIdsArrays);
      return fileIds;
    }

  /**
   * Handles downloading a file by opening the stream url in a new window
   *
   * @param {LearningObject.Material.File} file [The file to be downloaded]
   * @memberof UploadComponent
   */
  handleFileDownload(file: LearningObject.Material.File, learningObject: LearningObject) {
    const loId = learningObject.id;
    return this.http
      .get(
        FILE_MANAGER_ROUTES.DOWNLOAD_FILE(loId, file._id),
        { headers: this.headers, withCredentials: true, responseType: 'blob' }
      )
      .pipe(
        catchError(this.handleError)
      );
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

/**
 * Flattens nested arrays
 *
 * Taken from: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flat
 *
 * @param {any[]} arr1 [Array with nested arrays to be flattened]
 * @returns
 */
function flattenDeep(arr1: any[]): any[] {
  return arr1.reduce(
    (acc, val) =>
      Array.isArray(val) ? acc.concat(flattenDeep(val)) : acc.concat(val),
    []
  );
}
