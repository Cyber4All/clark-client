import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MISC_ROUTES } from '@env/route';

@Injectable()
export class MessagesService {
  constructor(private http: HttpClient) {}

  getStatus(): Promise<Array<{}>> {
      return this.http.get(MISC_ROUTES.CHECK_STATUS, {withCredentials:  true})
      .toPromise().then((val: any) => {
          return val;
      });
  }
}

