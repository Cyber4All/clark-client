import { Injectable } from '@angular/core';
import { USER_ROUTES } from '@env/route';
import 'rxjs/add/operator/toPromise';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../../core/auth.service';
import { LearningObject } from '@cyber4all/clark-entity';

@Injectable()
export class FileStorageService {
  constructor(private http: HttpClient, private auth: AuthService) {}

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
      username: this.auth.user.username,
      objectId: params.learningObject.id
    });

    return this.http
      .post(route, { filePath: params.filePath }, { withCredentials: true })
      .toPromise();
  }

  /**
   * Sends request to finalize multipart upload
   *
   * @param {{
   *     learningObject: LearningObject;
   *     fileId: string;
   *   }} params
   * @returns {Promise<any>}
   * @memberof FileStorageService
   */
  finalizeMultipart(params: {
    learningObject: LearningObject;
    fileId: string;
    fileMeta: any;
  }): Promise<any> {
    const route = USER_ROUTES.FINALIZE_MULTIPART({
      fileId: params.fileId,
      username: this.auth.user.username,
      objectId: params.learningObject.id
    });

    return this.http
      .patch(
        route,
        { fileMeta: params.fileMeta },
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
  delete(learningObject: LearningObject, filename: string): Promise<{}> {
    const route = USER_ROUTES.DELETE_FILE_FROM_LEARNING_OBJECT(
      this.auth.user.username,
      learningObject.id,
      filename
    );

    return this.http
      .delete(route, { withCredentials: true, responseType: 'text' })
      .toPromise();
  }
}
