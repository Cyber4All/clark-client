import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { UserService } from '../../core/user.service';

@Injectable()
export class ProfileGuard implements CanActivate {

  constructor(private router: Router, private user: UserService) { }

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    const username = state.url.split('/')[1];
    return this.user.validateUser(username).then(val => {
      if (val) {
        this.router.navigate(['users', username]);
        console.log(val);
        return true;
      } else {
        this.router.navigate(['/home']);
        return false;
      }
    });
  }
}
