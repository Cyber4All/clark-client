import { Injectable } from '@angular/core';
import { USER_ROUTES } from '@env/route';
import 'rxjs/add/operator/toPromise';
import { Http, Headers } from '@angular/http';
import { AuthService } from '../../../../core/auth.service';
import { CookieService } from 'ngx-cookie';
import { LearningObject } from '@cyber4all/clark-entity';
import { LearningObjectFile } from '../DirectoryTree';

@Injectable()
export class FileStorageService {
  private authHeader: { header: string; value: string };

  private token: string;
  private headers: Headers = new Headers();

  constructor(
    private http: Http,
    private auth: AuthService,
    private cookies: CookieService
  ) {
    this.token = cookies.get('presence');
    this.headers.append('Content-Type', 'application/json');
  }

  /**
   * Sends files to API for uploading to S3 bucket
   *
   * @param {string} learningObjectID
   * @param {File[]} files
   * @returns {Promise<LearningObjectFile[]>}
   * @memberof FileStorageService
   */
  upload(
    learningObject: LearningObject,
    files: File[] | any[],
    filePathMap: Map<string, string>
  ): Promise<LearningObjectFile[]> {
    return new Promise((resolve, reject) => {
      const formData: FormData = new FormData(),
        xhr: XMLHttpRequest = new XMLHttpRequest();
      formData.append('learningObjectID', learningObject.id);
      const stringifiedMap = this.stringifyMap(filePathMap);
      formData.append('filePathMap', stringifiedMap);
      for (let file of files) {
        formData.append(
          'uploads',
          file,
          `${file.name}!@!${file.id ? file.id : ''}`
        );
      }
      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            let response = xhr.response;
            if (typeof response === 'string') response = JSON.parse(response);
            resolve(response as LearningObjectFile[]);
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

  private stringifyMap(map: Map<any, any>): string {
    let pairArray = [];
    map.forEach((value, key) => {
      pairArray.push([key, value]);
    });
    return JSON.stringify(pairArray);
  }
}
