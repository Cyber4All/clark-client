import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { MISC_ROUTES } from '@env/route';
import { throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

export class Downtime {
  constructor(public isDown: boolean, public message: string) { }
}
@Injectable()
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
        return this.http.get(MISC_ROUTES.CHECK_DOWNTIME, { withCredentials: true })
        .pipe(
            retry(3),
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

