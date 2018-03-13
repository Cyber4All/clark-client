import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { USER_ROUTES } from '@env/route';
import { AuthService } from 'app/core/auth.service';
import { UserEdit } from '../cube/user-edit-information/user-edit-information.component';

@Injectable()
export class UserService {
  constructor(private http: Http, private auth: AuthService) {}

  editUserInfo(user: UserEdit): Promise<any> {
    return this.http
      .patch(
        USER_ROUTES.EDIT_USER_INFO,
        { user },
        {
          withCredentials: true
        }
      )
      .toPromise();
  }
}
