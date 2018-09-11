import { Injectable } from '@angular/core';
import { USER_ROUTES } from '@env/route';
import 'rxjs/add/operator/toPromise';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../../../core/auth.service';
import { LearningObject } from '@cyber4all/clark-entity';
import { File } from '@cyber4all/clark-entity/dist/learning-object';

@Injectable()
export class FileStorageService {
  private headers: HttpHeaders = new HttpHeaders();

  constructor(private http: HttpClient, private auth: AuthService) {
    this.headers.append('Content-Type', 'application/json');
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
}
