import { Injectable } from '@angular/core';
import { USER_ROUTES } from '@env/route';
import 'rxjs/add/operator/toPromise';
import { HttpClient } from '@angular/common/http';
import { LearningObject } from '@cyber4all/clark-entity';

@Injectable()
export class FileStorageService {
  constructor(private http: HttpClient) {}

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
    // @ts-ignore Sending body is legal
    return this.http
      .delete(
        route,
        { uploadId: params.uploadId },
        { withCredentials: true, responseType: 'text' }
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
      .toPromise();
  }
}
