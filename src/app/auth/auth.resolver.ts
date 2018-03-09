import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../core/auth.service';

@Injectable()
export class AuthResolve implements Resolve<string> {

  constructor(private router: Router, private auth: AuthService) {}

  resolve(route: ActivatedRouteSnapshot) {
    return window.location.pathname.indexOf('/auth') >= 0 ? '/' : window.location.pathname;
  }
}
