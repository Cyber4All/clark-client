import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { USER_ROUTES } from '@env/route';
import { AuthService } from 'app/core/auth.service';
import { UserEdit } from '../cube/user-profile/user-edit-information/user-edit-information.component';
import { User } from '@cyber4all/clark-entity';
import * as md5 from 'md5';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class UserService {
  socket;
  socketWatcher: Observable<string>;
  constructor(private http: Http, private auth: AuthService) {
  }

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
    return username && username !== 'undefined'
      ? this.http
          .get(USER_ROUTES.CHECK_USER_EXISTS(username), {
            withCredentials: true
          })
          .toPromise()
          .then(
            val => {
              return val.json() ? true : false;
            },
            error => {
              console.error(error);
              return false;
            }
          )
      : Promise.resolve(false);
  }

  searchUsers(query: {}) {
    return this.http
      .get(
        USER_ROUTES.SEARCH_USERS(query),
        {
          withCredentials: true
        }
      )
      .toPromise()
      .then(val => {
        const arr = val.json();
        return arr.map(member => User.instantiate(member));
      });
  }

  getOrganizationMembers(organization: string): Promise<User[]> {
    let route = USER_ROUTES.GET_SAME_ORGANIZATION(organization);
    return this.http
      .get(route)
      .toPromise()
      .then(val => {
        const arr = val.json();
        return arr.map(member => User.instantiate(member));
      });
  }

  getGravatarImage(email, imgSize): string {
    const defaultIcon = 'identicon';
    // r=pg checks the rating of the Gravatar image
    return (
      'https://www.gravatar.com/avatar/' +
      md5(email) +
      '?s=' +
      imgSize +
      '?r=pg&d=' +
      defaultIcon
    );
  }

  getUser(username: string): Promise<User> {
    return username && username !== 'undefined'
      ? this.http
          .get(USER_ROUTES.CHECK_USER_EXISTS(username), {
            withCredentials: true
          })
          .toPromise()
          .then(
            val => {
              const user = val.json();
              return user ? User.instantiate(user) : null;
            },
            error => {
              return null;
            }
          )
      : Promise.resolve(null);
  }
}
