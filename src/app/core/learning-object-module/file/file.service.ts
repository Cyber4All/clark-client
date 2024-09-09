import { Injectable, Input } from '@angular/core';
import { FILE_ROUTES } from './file.routes';
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
    authorUsername: string,
    objectId: string,
    fileId: string,
    description: string
  ): Promise<any> {
    const route = FILE_ROUTES.UPDATE_FILE(
      authorUsername,
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
      FILE_ROUTES.UPDATE_PDF(id),
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
   * Fetches Learning Object's Materials
   *
   * @param {string} authorUsername
   * @param {string} objectId
   * @param {string} description
   * @returns {Promise<any>}
   * @memberof LearningObjectService
   */
    getMaterials(objectId: string): Promise<any> {
      const route = FILE_ROUTES.GET_MATERIALS(objectId, 'unreleased');
      return this.http.get(route, { withCredentials: true })
        .pipe(
          catchError(this.handleError)
        )
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
    files
  }: {
      objectId: string;
      files: FileUploadMeta[];
    }): Promise<string[]> {
      const route = FILE_ROUTES.UPLOAD_FILE_META(objectId);
      return this.handleFileMetaRequests(files, route);
    }

  /**
   * Handles file meta data requests
   *
   * *** NOTE ***
   * Requests are handled in batches if data payload is too large (Will only send at most `MAX_PER_REQUEST` file meta in a single request)
   *
   * @private
   * @param {FileUploadMeta[]} files [List of file meta to be added]
   * @param {string} route [Route to make request to]
   * @returns
   * @memberof LearningObjectService
   */
  private handleFileMetaRequests(
    files: FileUploadMeta[],
    route: string
  ): Promise<string[]> {
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
