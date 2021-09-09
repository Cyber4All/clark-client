import { User } from '@entity';
import { AuthService } from '../../core/auth.service';
import {
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Resolve,
  Router
} from '@angular/router';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UserService } from '../../core/user.service';

@Injectable()
export class UserResolver implements Resolve<User> {
  constructor(
    private auth: AuthService,
    private user: UserService,
    private router: Router
  ) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<any> | Promise<any> | any {
    if (this.auth.status && this.auth.user.username === route.params.username) {
      return this.auth.user;
    } else {
      return this.user.getUser(route.params.username, 'username').then(val => {
        if (val) {
          return val;
        } else {
          this.router.navigate(['home']);
        }
      });
    }
  }
}
