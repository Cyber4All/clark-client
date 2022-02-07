import { Injectable } from '@angular/core';
import {
  Router,
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot
} from '@angular/router';
import { AuthService } from './auth.service';
import { CookieService } from 'ngx-cookie';

/**
 * Defines an AuthGuard which contains the logic for determining of a user can activate a route protected by the guard.
 *
 * @author Sean Donnelly
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private auth: AuthService,
    private cookies: CookieService
  ) {}

  /**
   * This method returns a boolean indicating whther or not navigation to a route should be allowed.
   *
   * @param route
   * @param state
   */
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean> | boolean {
    const c = this.cookies.get('presence');

    if (c) {
      return this.auth.validateAndRefreshToken().then(
        val => {
          this.auth.isLoggedIn.subscribe(status => {
            // "status" is true if user is logged in , false if they are not logged in
            // if the user is not logged in, go to home
            if (!status) {
              this.router.navigate(['home'], {
              });
            }
          });
          // if user is logged in, return true
          return true;
        },
        // catches error sets in the service
        error => {
          this.router.navigate(['/auth/login'], {
            queryParams: { redirectUrl: state.url }
          });
          return false;
        }
      );
    } else {
      // if the user has no cookie, go to the login page
      this.router.navigate(['/auth/login'], {
        queryParams: { redirectUrl: state.url }
      });
      return false;
    }
  }
}
