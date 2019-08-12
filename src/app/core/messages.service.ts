import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { MISC_ROUTES } from '@env/route';
import { throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

@Injectable()
export class MessagesService {
    private _message: Message;

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
                    // tslint:disable-next-line: no-use-before-declare
                    this._message = new Message(val.isUnderMaintenance, val.message);
                    return this._message;
                });
        }
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

export class Message {
    isUnderMaintenance: boolean;
    message: string;

    constructor(isUnderMaintenance: boolean, message: string) {
        this.isUnderMaintenance = isUnderMaintenance;
        this.message = message;
    }
}
