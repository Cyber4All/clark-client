import { Injectable } from '@angular/core';
import { Topic } from '@entity';
import { catchError } from 'rxjs/operators';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { throwError } from 'rxjs';
import { TOPICS_ROUTES } from './topics.routes';

@Injectable({
  providedIn: 'root'
})
export class TopicsService {
  private headers = new HttpHeaders();

  constructor(private http: HttpClient) { 
  }

  /**
   * This gets the list of object topics from the backend to display
   *
   * @returns A list of topics
   */
  async getTopics(): Promise<Topic[]> {
    return await new Promise((resolve, reject) => {
      this.http
        .get<Topic[]>(TOPICS_ROUTES.GET_ALL_TOPICS(),
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
            const sorted = res.sort((a, b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0));
            resolve(sorted);
          },
          (err) => {
            reject(err);
          }
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
