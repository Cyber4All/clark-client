import { Injectable } from '@angular/core';
import { USER_ROUTES } from '@env/route';

import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { retry, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { LearningObject } from '@entity';
import { CookieService } from 'ngx-cookie';

export interface FileUploadMeta {
  name: string;
  fileType: string;
  path: string;
  size: number;
}

@Injectable()
export class FileStorageService {
  private token: string;
  constructor(private http: HttpClient, private cookie: CookieService) {
    this.token = this.cookie.get('presence');
  }

  /**
   * Sends request to initiate multipart upload
   *
   * @param {{
   *     learningObject: LearningObject;
   *     fileId: string;
   *     filePath: string;
   *   }} params
   * @returns {Promise<any>}
   * @memberof FileStorageService
   */
  initMultipart(params: {
    learningObject: LearningObject;
    fileId: string;
    filePath: string;
  }): Promise<any> {
    const route = USER_ROUTES.INIT_MULTIPART({
      fileId: params.fileId,
      username: params.learningObject.author.username,
      objectId: params.learningObject.id
    });

    return this.http
      .post(route, { filePath: params.filePath }, { withCredentials: true })
      .pipe(
        retry(3),
        catchError(this.handleError)
      )
      .toPromise()
      .then((res: { uploadId: string }) => res.uploadId);
  }

  /**
   * Sends request to initiate multipart upload
   *
   * @param {{
   *     learningObject: LearningObject;
   *     fileId: string;
   *     filePath: string;
   *   }} params
   * @returns {Promise<any>}
   * @memberof FileStorageService
   */
  initMultipartAdmin({
    learningObjectId,
    authorUsername,
    fileId,
    fileUploadMeta
  }: {
    learningObjectId: string;
    authorUsername: string;
    fileId: string;
    fileUploadMeta: FileUploadMeta;
  }): Promise<any> {
    const route = USER_ROUTES.INIT_MULTIPART_ADMIN({
      fileId: fileId,
      username: authorUsername,
      objectId: learningObjectId
    });

    return this.http
      .post(
        route,
        { fileUploadMeta },
        { headers: { Authorization: `Bearer ${this.token}` } }
      )
      .pipe(
        retry(3),
        catchError(this.handleError)
      )
      .toPromise()
      .then((res: { uploadId: string }) => res.uploadId);
  }

  /**
   * Sends request to finalize multipart upload
   *
   * @param {{
   *     learningObject: LearningObject;
   *     fileId: string;
   *     uploadId: string;
   *   }} params
   * @returns {Promise<any>}
   * @memberof FileStorageService
   */
  finalizeMultipart(params: {
    learningObject: LearningObject;
    fileId: string;
    uploadId: string;
    fileMeta: any;
  }): Promise<any> {
    const route = USER_ROUTES.FINALIZE_MULTIPART({
      fileId: params.fileId,
      username: params.learningObject.author.username,
      objectId: params.learningObject.id
    });

    return this.http
      .patch(
        route,
        { fileMeta: params.fileMeta, uploadId: params.uploadId },
        { withCredentials: true, responseType: 'text' }
      )
      .pipe(
        retry(3),
        catchError(this.handleError)
      )
      .toPromise();
  }

  /**
   * Sends request to finalize multipart upload
   *
   * @param {{
   *     learningObject: LearningObject;
   *     fileId: string;
   *     uploadId: string;
   *   }} params
   * @returns {Promise<any>}
   * @memberof FileStorageService
   */
  finalizeMultipartAdmin({
    learningObjectId,
    authorUsername,
    fileId,
    uploadId
  }: {
    learningObjectId: string;
    authorUsername: string;
    fileId: string;
    uploadId: string;
  }): Promise<any> {
    const route = USER_ROUTES.FINALIZE_MULTIPART_ADMIN({
      fileId,
      username: authorUsername,
      objectId: learningObjectId,
      uploadId: uploadId
    });

    return this.http
      .patch(route, {
        headers: { Authorization: `Bearer ${this.token}` },
        responseType: 'text'
      })
      .pipe(
        retry(3),
        catchError(this.handleError)
      )
      .toPromise();
  }

  /**
   * Sends request to abort multipart upload
   *
   * @param {{
   *     learningObject: LearningObject;
   *     fileId: string;
   *     uploadId: string;
   *     fileMeta: any;
   *   }} params
   * @returns {Promise<any>}
   * @memberof FileStorageService
   */
  abortMultipart(params: {
    learningObject: LearningObject;
    fileId: string;
    uploadId: string;
  }): Promise<any> {
    const route = USER_ROUTES.ABORT_MULTIPART({
      fileId: params.fileId,
      username: params.learningObject.author.username,
      objectId: params.learningObject.id
    });
    return this.http
      .delete(
        route,
        { withCredentials: true, responseType: 'text' }
      )
      .pipe(
        retry(3),
        catchError(this.handleError)
      )
      .toPromise();
  }

  /**
   * Sends request to abort multipart upload
   *
   * @param {{
   *     learningObject: LearningObject;
   *     fileId: string;
   *     uploadId: string;
   *     fileMeta: any;
   *   }} params
   * @returns {Promise<any>}
   * @memberof FileStorageService
   */
  abortMultipartAdmin(params: {
    learningObjectId: string;
    authorUsername: string;
    fileId: string;
    uploadId: string;
  }): Promise<any> {
    const route = USER_ROUTES.ABORT_MULTIPART_ADMIN({
      fileId: params.fileId,
      username: params.authorUsername,
      objectId: params.learningObjectId,
      uploadId: params.uploadId
    });
    return this.http
      .delete(route, {
        headers: { Authorization: `Bearer ${this.token}` },
        responseType: 'text'
      })
      .pipe(
        retry(3),
        catchError(this.handleError)
      )
      .toPromise();
  }

  /**
   * Sends learning object ID and file name to API for deletion.
   *
   * @param {string} learningObjectID
   * @param {string} filename
   * @returns {Promise<{}>}
   * @memberof FileStorageService
   */
  delete(learningObject: LearningObject, fileId: string): Promise<{}> {
    const route = USER_ROUTES.DELETE_FILE_FROM_LEARNING_OBJECT(
      learningObject.author.username,
      learningObject.id,
      fileId
    );

    return this.http
      .delete(route, { withCredentials: true, responseType: 'text' })
      .pipe(
        retry(3),
        catchError(this.handleError)
      )
      .toPromise();
  }

  /**
   * Sends learning object ID and file name to API for deletion.
   *
   * @param {string} learningObjectID
   * @param {string} filename
   * @returns {Promise<{}>}
   * @memberof FileStorageService
   */
  deleteAdmin(learningObject: LearningObject, fileId: string): Promise<{}> {
    const route = USER_ROUTES.DELETE_FILE_FROM_LEARNING_OBJECT(
      learningObject.author.username,
      learningObject.id,
      fileId
    );

    return this.http
      .delete(route, {
        headers: { Authorization: `Bearer ${this.token}` },
        responseType: 'text'
      })
      .pipe(
        retry(3),
        catchError(this.handleError)
      )
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
