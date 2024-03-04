import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { CookieAgreementService } from 'app/core/auth-module/cookie-agreement.service';
import { ToastrOvenService } from '../../shared/modules/toaster/notification.service';

/**
 * Checks if the cookie agreement has been accepted.
 * Used to block access to the registration page if cookies have not been accepted
 */
@Injectable({
  providedIn: 'root'
})
export class CookieGuard implements CanActivate {
  constructor(
    private cookieAgreement: CookieAgreementService,
    private toaster: ToastrOvenService
  ) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const cookie = this.cookieAgreement.getCookieAgreementVal();
    if (!cookie) {
      this.toaster.error('Cookies not accepted', 'Please accept our cookies to continue registration');
      return false;
    }
    return true;
  }
}
