import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { MISC_ROUTES } from '@env/route';

@Injectable()
export class MessagesService {
  constructor(private http: Http) {}

  getStatus(): Promise<Array<{}>> {
      return this.http.get(MISC_ROUTES.CHECK_STATUS, {withCredentials:  true}).toPromise().then(val => {
          return val.json();
      });
  }
}

