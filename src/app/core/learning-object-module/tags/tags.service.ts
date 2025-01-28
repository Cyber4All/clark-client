import { Injectable } from '@angular/core';
import { Topic } from '@entity';
import { catchError } from 'rxjs/operators';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { throwError } from 'rxjs';
import { TAGS_ROUTES } from './tags.routes';

@Injectable({
  providedIn: 'root'
})
export class TagsService {
  private headers = new HttpHeaders();

  constructor(private http: HttpClient) {
  }

  /**
   * This gets the list of object topics from the backend to display
   *
   * @returns A list of topics
   */
  async getTags(query?: any): Promise<Topic[]> {
    query = {
      text: query?.text,
      sort: 1,
      limit: 40
    };
    return await new Promise((resolve, reject) => {
      this.http
        .get<Topic[]>(TAGS_ROUTES.GET_ALL_TAGS(query),
          {
            headers: this.headers,
            withCredentials: true,
          }
        )
        .pipe(

          catchError(this.handleError)
        )
        .toPromise()
        .then(
          (res: any) => {
            resolve(res.tags);
          },
          (err) => {
            reject(err);
          }
        );
    });
  }

  /**
   *  This function updates the learning the object with the selected tagged topics
   *
   * @param username  username of learning object owner
   * @param learningObjectId  user id
   * @param topicIds  id of Topic object
   */
  async updateObjectTags(learningObjectCuid: string, tags: string[]): Promise<void> {
    return await new Promise((resolve, reject) => {
      this.http
        .put(TAGS_ROUTES.UPDATE_TAG(learningObjectCuid),
          { tags },
          {
            headers: this.headers,
            withCredentials: true,
            responseType: 'text',
          }
        )
        .pipe(
          catchError(this.handleError)
        )
        .toPromise()
        .then(
          (res: any) => resolve(res),
          (err) => reject(err),
        );
    });
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
