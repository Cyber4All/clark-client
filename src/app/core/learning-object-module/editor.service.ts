import { Injectable } from '@angular/core';
import { LEGACY_USER_ROUTES } from '../learning-object-module/learning-object/learning-object.routes';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EditorService {
  constructor(private http: HttpClient) { }

  /**
   * changeStatus updates the status of a given Learning Object.
   *
   * @param id the Learning Object ID
   * @param authorUsername the username of the author
   * @param status the new status for the Learning Object
   */
  changeStatus(
    id: string,
    authorUsername: string,
    status: string,
  ): Observable<string> {
    const route = LEGACY_USER_ROUTES.UPDATE_MY_LEARNING_OBJECT(authorUsername, id);
    return this.http
      .patch(
        route,
        { learningObject: { status } },
        { withCredentials: true, responseType: 'text' }
      );
  }
}
