import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../auth-module/auth.service';
import { CookieService } from 'ngx-cookie';

@Injectable({
  providedIn: 'root'
})
export class NcyteDashboardGuard implements CanActivate {
  constructor(private router: Router, private auth: AuthService, private cookies: CookieService) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> | boolean {
    const c = this.cookies.get('presence');

    if (c) {
      return this.auth.validateAndRefreshToken().then(val => {
        return (
          this.auth.accessGroups.includes('curator@ncyte') ||
          this.auth.accessGroups.includes('admin') ||
          this.auth.accessGroups.includes('editor@ncyte')
        );
      }, error => {
        return this.router.navigate(['/home']);
      });
    } else {
      return this.router.navigate(['/home']);
    }
  }
}
