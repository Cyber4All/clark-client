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

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean> | boolean {
    const c = this.cookies.get('presence');

    if (c) {
      return this.auth.validate().then(
        val => {
          this.auth.isLoggedIn.subscribe(status => {
            if (!status) {
              this.router.navigate(['/auth/login'], {
                queryParams: { redirectUrl: state.url }
              });
            }
          });
          return true;
        },
        error => {
          this.router.navigate(['/auth/login'], {
            queryParams: { redirectUrl: state.url }
          });
          return false;
        }
      );
    } else {
      this.router.navigate(['/auth/login'], {
        queryParams: { redirectUrl: state.url }
      });
      return false;
    }
  }
}
