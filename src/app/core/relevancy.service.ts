import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { RELEVANCY_ROUTES } from '@env/route';
import { AuthService } from './auth.service';
import { catchError, retry } from 'rxjs/operators';
import { throwError } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class RelevancyService {
  private user;
  private headers = new HttpHeaders();

  constructor(private http: HttpClient, private auth: AuthService) {
    this.setHeaders();
   }

   /**
    * Sets the headers for the requests
    */
  setHeaders() {
    // get new user from auth service
    this.user = this.auth.user || undefined;

    // reset headers with new users auth token
    this.headers = new HttpHeaders();
  }
   /**
   * Sets the nextCheck of a learning object
   * @param username Username of the author
   * @param learningObjectId learningObjectId
   * @param date The date that nextCheck needs to updated to
   */
  async setNextCheckDate(username: string, learningObjectId: string, date: Date): Promise<any> {
    return this.http
      .patch(RELEVANCY_ROUTES.NEXT_CHECK(username, learningObjectId),
        { date },
        { 
          headers: this.headers,
          withCredentials: true,
          responseType: 'text'
        }
      )
      .pipe(
        retry(3),
        catchError(this.handleError)
      )
      .toPromise();
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
