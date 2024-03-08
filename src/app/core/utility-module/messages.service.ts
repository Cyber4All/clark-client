import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { UTILITY_ROUTES } from './utility.routes';

export class Downtime {
  constructor(public isDown: boolean, public message: string) { }
}
@Injectable({
  providedIn: 'root'
})
export class MessagesService {
  /**
   * Format for banner message
   *
   * new downtime(true, 'The CLARK team will conduct regular maintenance of the CLARK system on Wednesday February'+
  ' 22, 2023 from 6:00AM-8:00AM EST. CLARK will be available but some users might see downgraded performance');
   */
  private _downtime: Downtime;

  get message() {
    return this._downtime;
  }

  constructor(private http: HttpClient) { }
  getDowntime(): Promise<Downtime> {
    return this.http.get(UTILITY_ROUTES.GET_DOWNTIME(), { withCredentials: true })
      .pipe(

        catchError(this.handleError)
      )
      .toPromise()
      .then((val: Downtime) => {
        return val;
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

