import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../auth-module/auth.service';
import { CookieService } from 'ngx-cookie-service';

/**
 * Defines an AuthGuard which contains the logic for determining of a user can activate a route protected by the guard.
 *
 * @author Sean Donnelly
 */
@Injectable({
  providedIn: 'root'
})
export class UserVerifiedGuard implements CanActivate {

  constructor(private router: Router, private auth: AuthService, private cookies: CookieService) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> | boolean {
    const c = this.cookies.get('presence');

    if (c) {
      return this.auth.validateToken().then(val => {
        if (this.auth.user.emailVerified) {
          return true;
        }
        this.router.navigate(['/onion/dashboard']);
        return false;
      }, error => {
        this.router.navigate(['/onion/dashboard']);
        return false;
      });
    } else {
      this.router.navigate(['/onion/dashboard']);
      return false;
    }
  }
}
