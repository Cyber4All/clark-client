import { Injectable } from '@angular/core';
import { USER_ROUTES } from '@env/route';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
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
    const route = USER_ROUTES.UPDATE_MY_LEARNING_OBJECT(authorUsername, id);
    return this.http
      .patch(
        route,
        { learningObject: { status } },
        { withCredentials: true, responseType: 'text' }
      );
  }
}
