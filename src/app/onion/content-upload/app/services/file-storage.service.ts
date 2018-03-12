import { Injectable } from '@angular/core';
import { LearningObjectFile } from '../models/learning-object-file';
import { USER_ROUTES } from '@env/route';
import 'rxjs/add/operator/toPromise';
import { Http, Headers } from '@angular/http';
import { AuthService } from '../../../../core/auth.service';
import { CookieService } from 'ngx-cookie';
import { LearningObject } from '@cyber4all/clark-entity';

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
    files: File[]
  ): Promise<LearningObjectFile[]> {
    return new Promise((resolve, reject) => {
      const formData: FormData = new FormData(),
        xhr: XMLHttpRequest = new XMLHttpRequest();
      formData.append('learningObjectID', learningObject.id);
      for (let i = 0; i < files.length; i++) {
        formData.append('uploads', files[i], files[i].name);
        xhr.onreadystatechange = () => {
          if (xhr.readyState === 4) {
            if (xhr.status === 200) {
              resolve(xhr.response as LearningObjectFile[]);
            } else {
              reject(xhr.response);
            }
          }
        };
        const route = USER_ROUTES.POST_FILE_TO_LEARNING_OBJECT(
          this.auth.user.username,
          learningObject.name
        );
        xhr.open('POST', route, true);
        xhr.withCredentials = true;
        xhr.send(formData);
      }
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
      .toPromise()
      .then(success => success.json())
      .catch(error => console.log);
  }
}
