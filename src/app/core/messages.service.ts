import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { MISC_ROUTES } from '@env/route';
import { throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

export class Message {
  constructor(public isUnderMaintenance: boolean, public message: string) { }
}
@Injectable()
export class MessagesService {
  private _message: Message = new Message(true, ('12/07/2021 @ 12:00pm: CLARK is experiencing some technical difficulties with ' +
    'the AWS us-east-1 outage. Please standby, we will update this banner as we hear more.'));

  get message() {
    return this._message;
  }

  constructor(private http: HttpClient) { }

  getStatus(): Promise<Message> {
    if (this._message) {
      return Promise.resolve(this._message);
    } else {
      return this.http.get(MISC_ROUTES.CHECK_STATUS, { withCredentials: true })
        .pipe(
          retry(3),
          catchError(this.handleError)
        )
        .toPromise()
        .then((val: Message) => {
          this._message = new Message(val.isUnderMaintenance, val.message);
          return this._message;
        });
    }
  }

    getMaintenance() {
        return this.http.get(MISC_ROUTES.CHECK_MAINTENANCE, { withCredentials: true })
        .pipe(
            retry(3),
            catchError(this.handleError)
        )
        .toPromise()
        .then((val: boolean) => {
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

