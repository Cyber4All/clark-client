import { Injectable, Input } from '@angular/core';
import { FILE_MANAGER_ROUTES, FILE_METADATA_ROUTES } from './file.routes';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { catchError, takeUntil } from 'rxjs/operators';
import { Observable, Subject, throwError } from 'rxjs';
import { FileUploadMeta } from 'app/onion/learning-object-builder/components/content-upload/app/services/typings';
import { LearningObject } from '@entity';

@Injectable({
  providedIn: 'root',
})
export class FileService {
  private headers = new HttpHeaders();

  @Input()
  learningObject$: Observable<LearningObject> =
    new Observable<LearningObject>();

  constructor(private http: HttpClient) { }

  /**
   * Helper: extracts the file extension from a filename (including the dot)
   * @param filename - The filename to extract extension from
   * @returns The file extension in lowercase, or empty string if no extension
   */
  private static getFileExtension(filename: string): string {
    const lastDot = filename.lastIndexOf('.');
    if (lastDot !== -1 && lastDot < filename.length - 1) {
      return filename.substring(lastDot).toLowerCase();
    }
    return '';
  }

  /**
   * Helper: returns true if filename is a supported Microsoft Office file
   */
  static isOfficeFile(filename: string): boolean {
    const officeExtensions = [
      '.docx',
      '.doc',
      '.pptx',
      '.ppt',
      '.ppsx',
      '.pps',
      '.potx',
      '.pot',
      '.xlsx',
      '.xls',
    ];
    return officeExtensions.includes(this.getFileExtension(filename));
  }

  /**
   * Helper: returns true if filename can be previewed
   * Currently supports Microsoft Office files, extensible for future file types
   */
  static canPreview(filename: string): boolean {
    return this.isOfficeFile(filename);
  }

  /**
   * Download the learning object file (for any type).
   * @param url public/authorized file URL
   * @param name file name to use for download
   */
  async downloadLearningObjectFile(url: string, name: string): Promise<string> {
    return this.http
      .get(url, {
        withCredentials: true,
        responseType: 'blob',
        observe: 'response',
      })
      .pipe(catchError(this.handleError))
      .toPromise()
      .then((response: any) => {
        // Extract the blob from the response
        const blob = response.body;
        // Create a URL for the blob
        const blobUrl = window.URL.createObjectURL(blob);
        // Trigger a download using an anchor element
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = name;
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
   * Preview the file if it can be previewed.
   * @param url file URL
   * @param name file name (to check extension)
   */
  async previewLearningObjectFile(url: string, name: string): Promise<string> {
    if (FileService.canPreview(name)) {
      // Currently only handles Office files, extensible for other file types

      // Microsoft Office files
      if (FileService.isOfficeFile(name)) {
        const encodedUrl = encodeURIComponent(url);
        const officeViewerUrl = `https://view.officeapps.live.com/op/view.aspx?src=${encodedUrl}`;
        window.open(officeViewerUrl, '_blank');
      }
      return Promise.resolve('');
    } else {
      // Not a previewable file; do nothing for now but return Promise.resolve('')
      return Promise.resolve('');
    }
  }

  async deleteLearningObjectFileMetadata(
    learningObjectId: string,
    fileId: string,
  ): Promise<void> {
    this.http
      .delete(
        FILE_METADATA_ROUTES.DELETE_LEARNING_OBJECT_FILE_METADATA(
          learningObjectId,
          fileId,
        ),
        {
          headers: this.headers,
          withCredentials: true,
        },
      )
      .pipe(catchError(this.handleError))
      .toPromise();
  }

  updateFileDescription(
    objectId: string,
    fileId: string,
    description: string,
  ): Promise<any> {
    const route = FILE_METADATA_ROUTES.UPDATE_LEARNING_OBJECT_FILE_METADATA(
      objectId,
      fileId,
    );
    return this.http
      .patch(
        route,
        { description },
        { headers: this.headers, withCredentials: true, responseType: 'text' },
      )
      .pipe(catchError(this.handleError))
      .toPromise();
  }

  // Updates the README of a learning object
  async updateReadme(id: string): Promise<any> {
    return await this.http
      .patch(
        FILE_MANAGER_ROUTES.UPDATE_README(id),
        {},
        {
          headers: this.headers,
          withCredentials: true,
          responseType: 'text',
        },
      )
      .pipe(catchError(this.handleError))
      .toPromise();
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
    files,
  }: {
    objectId: string;
    files: FileUploadMeta[];
  }): Promise<string[]> {
    const route =
      FILE_METADATA_ROUTES.ADD_LEARNING_OBJECT_FILE_METADATA(objectId);
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
  toggleBundle(learningObjectId: string, fileIDs: string[], state: boolean) {
    return this.http
      .patch(
        FILE_MANAGER_ROUTES.UPDATE_BUNDLE(learningObjectId),
        {
          fileIDs: fileIDs,
          packagable: state,
        },
        { headers: this.headers, withCredentials: true },
      )
      .pipe(catchError(this.handleError))
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
    sendNextBatch$: Subject<void>,
  ) {
    const response$ = this.http
      .post(
        route,
        { fileMeta: batch },
        {
          headers: this.headers,
          withCredentials: true,
        },
      )
      .pipe(catchError(this.handleError))
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
    responses$: Promise<string[]>[],
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
  handleFileDownload(
    file: LearningObject.Material.File,
    learningObject: LearningObject,
  ) {
    const loId = learningObject.id;
    return this.http
      .get(FILE_MANAGER_ROUTES.DOWNLOAD_FILE(loId, file._id), {
        headers: this.headers,
        withCredentials: true,
        responseType: 'blob',
        observe: 'response',
      })
      .pipe(catchError(this.handleError))
      .toPromise()
      .then((response: any) => {
        // Extract the blob from the response
        const blob = response.body;
        // Create a URL for the blob
        const blobUrl = window.URL.createObjectURL(blob);
        // Trigger a download using an anchor element
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = file.name; //Use the extracted file name
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        // Revoke the blob URL to free memory
        window.URL.revokeObjectURL(blobUrl);
        return '';
      });
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
    [],
  );
}
