import { Injectable } from '@angular/core';
import { USER_ROUTES } from '@env/route';
import 'rxjs/add/operator/toPromise';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../../../../core/auth.service';
import { LearningObject } from '@cyber4all/clark-entity';

@Injectable()
export class FileStorageService {
  constructor(private http: HttpClient, private auth: AuthService) {}

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
      this.auth.user.username,
      learningObject.id,
      fileId
    );

    return this.http
      .delete(route, { withCredentials: true, responseType: 'text' })
      .toPromise();
  }
}
