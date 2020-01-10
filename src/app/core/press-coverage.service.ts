import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

export class Mention {
  constructor(public title: string, public link: string, public icon: string) { }
}

@Injectable({
  providedIn: 'root'
})
export class PressCoverageService {
  private _mentions: Mention[];

  get mentions() {
    return this._mentions;
  }
  constructor(private http: HttpClient) { }

  getMentions(): Promise<Mention[]> {
    if (this._mentions) {
      return Promise.resolve(this._mentions);
    } else {
      return this.http.get('assets/images/press/mentions.json', { responseType: 'json' })
        .pipe(
          retry(3),
          catchError(this.handleError)
        )
        .toPromise()
        .then((val: Mention[]) => {
          this._mentions = [];
          val.forEach(v => {
            this._mentions.push(new Mention(v.title, v.link, v.icon));
          });
          return this._mentions;
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
