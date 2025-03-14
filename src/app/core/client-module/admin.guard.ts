import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../auth-module/auth.service';
import { CookieService } from 'ngx-cookie-service';

/**
 * Defines an AdminGuard which contains the logic for determining of a user can activate a route protected by the guard.
 *
 * @author Nick Winner
 */
@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  constructor(private router: Router, private auth: AuthService, private cookies: CookieService) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> | boolean {
    const c = this.cookies.get('presence');

    if (c) {
      return this.auth.validateToken().then(val => {
        return this.auth.hasCuratorAccess();
      }, error => {
        return false;
      });
    } else {
      return false;
    }
  }
}
