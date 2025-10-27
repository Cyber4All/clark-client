import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthService } from '../auth-module/auth.service';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root',
})
export class CyberSkillsGuard  {
  constructor(
    private router: Router,
    private auth: AuthService,
    private cookies: CookieService,
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Promise<boolean | UrlTree> | boolean {
    const c = this.cookies.get('presence');

    if (c) {
      return this.auth.validateToken().then(
        (val) => {
          return (
            this.auth.accessGroups.includes('admin') ||
            this.auth.accessGroups.includes('editor') ||
            this.auth.accessGroups.includes('curator@cyberskills2work') ||
            this.auth.accessGroups.includes('reviewer@cyberskills2work')
          );
        },
        (error) => {
          return this.router.navigate(['/home']);
        },
      );
    } else {
      return this.router.navigate(['/home']);
    }
  }
}
