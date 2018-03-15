import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { USER_ROUTES } from '@env/route';
import { AuthService } from 'app/core/auth.service';
import { UserEdit } from '../cube/user-profile/user-edit-information/user-edit-information.component';
import { User } from '@cyber4all/clark-entity';

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

  validateUser(username: string): Promise<boolean> {
    return this.http.get(USER_ROUTES.CHECK_USER_EXISTS(username), { withCredentials: true }).toPromise().then(val => {
      return (<string[]> val.json()).length > 0;
    }, error => {
      console.error(error);
      return false;
    });
  }

  getUser(username: string): Promise<User> {
    return this.http.get(USER_ROUTES.CHECK_USER_EXISTS(username), { withCredentials: true }).toPromise().then(val => {
      const arr = val.json();
      if (arr.length) {
        return User.instantiate(arr[0]);
      } else {
        return null;
      }
    }, error => {
      return null;
    });
  }
}

