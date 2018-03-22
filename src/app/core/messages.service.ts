import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { USER_ROUTES } from '@env/route';
import { AuthService } from 'app/core/auth.service';
import { UserEdit } from '../cube/user-profile/user-edit-information/user-edit-information.component';
import { User } from '@cyber4all/clark-entity';
import { MISC_ROUTES } from '../../environments/route';

@Injectable()
export class MessagesService {
  constructor(private http: Http) {}

  getStatus(): Promise<Array<{}>> {
      return this.http.get(MISC_ROUTES.CHECK_STATUS, {withCredentials:  true}).toPromise().then(val => {
          return val.json();
      });
  }
}

