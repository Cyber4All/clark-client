import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { UserService } from '../../core/user.service';

@Injectable()
export class ProfileGuard implements CanActivate {

  constructor(private router: Router, private user: UserService) { }

  /**
   * Checks if a username is tied to a profile and redirects to that profile.
   * If no user is found, the guard redirects to home.
   *
   * @param {ActivatedRouteSnapshot} next
   * @param {RouterStateSnapshot} state
   * @returns {(Observable<boolean> | Promise<boolean> | boolean)} whether or not the route can be activated.
   * @memberof ProfileGuard
   */
  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    const username = state.url.split('/')[1];
    return this.user.validateUser(username).then(val => {
      if (val) {
        this.router.navigate(['users', username]);
        return true;
      } else {
        this.router.navigate(['/home']);
        return false;
      }
    });
  }
}
