import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot
} from '@angular/router';
import { AuthService } from './auth-module/auth.service';

@Injectable()
export class AccessGroupGuard implements CanActivate {
  constructor(private router: Router, private authService: AuthService) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const acceptedGroups = route.data['accessGroups'] as string[];
    const userGroups = this.authService.accessGroups;
    for (const group of acceptedGroups) {
      if (userGroups.includes(group)) {
        return true;
      }
    }
    this.router.navigate(['/auth/login'], {
      queryParams: { redirectUrl: state.url }
    });
    return false;
  }
}
