import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthenticationService } from './authentication.service';

/**
 * Defines an AuthGuard which contains the logic for determining of a user can activate a route protected by the guard.
 * 
 * @author Sean Donnelly
 */
@Injectable()
export class AuthGuard implements CanActivate {

  constructor(private router: Router, private auth: AuthenticationService) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> | boolean {
    const user = this.auth.getUser();
    if (user && user.token) {
      const isLoggedIn = this.auth.validateToken(user.token).then(status => {
        if (!status) {
          this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
        }
        return status;
      }).catch(e => {
        console.log('canActivate: ',e);
        return false;
      });
      return isLoggedIn;
    } else {
      this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
      return false;
    }
  }
}