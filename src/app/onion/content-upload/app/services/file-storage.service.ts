import { Injectable } from '@angular/core';
import { USER_ROUTES } from '@env/route';
import 'rxjs/add/operator/toPromise';
import { Http, Headers } from '@angular/http';
import { AuthService } from '../../../../core/auth.service';
import { LearningObject } from '@cyber4all/clark-entity';
import { File } from '@cyber4all/clark-entity/dist/learning-object';
import { DZFile } from '../upload/upload.component';
type LearningObjectFile = File;
@Injectable()
export class FileStorageService {
  private headers: Headers = new Headers();

  constructor(private http: Http, private auth: AuthService) {
    this.headers.append('Content-Type', 'application/json');
  }

  /**
   * Sends file to API for uploading to S3 bucket
   *
   * @param {string} learningObjectID
   * @param {any[]} file
   * @returns {Promise<LearningObjectFile[]>}
   * @memberof FileStorageService
   */
  upload(
    learningObject: LearningObject,
    file: DZFile | any
  ): Promise<LearningObjectFile> {
    return new Promise((resolve, reject) => {
      const formData: FormData = new FormData(),
        xhr: XMLHttpRequest = new XMLHttpRequest();
      formData.append('learningObjectID', learningObject.id);
      formData.append(
        'uploads',
        file,
        `${file.fullPath ? this.encodeFilePath(file.fullPath) : file.name}`
      );

      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            let response = xhr.response;
            if (typeof response === 'string') {
              response = JSON.parse(response);
            }
            resolve(response as LearningObjectFile);
          } else {
            reject(xhr.response);
          }
        }
      };
      const route = USER_ROUTES.POST_FILE_TO_LEARNING_OBJECT;
      xhr.open('POST', route, true);
      xhr.withCredentials = true;
      xhr.send(formData);
    });
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
      .delete(route, { headers: this.headers, withCredentials: true })
      .toPromise();
  }

  private encodeFilePath(path: string): string {
    const escapedSlash = /%2F/g;
    const replacementChar = '%2F';
    if (escapedSlash.test(path)) {
      path = path.replace(escapedSlash, `"%2F"`);
    }
    const sanitized = path.replace(/\//g, replacementChar);
    return sanitized;
  }
}
