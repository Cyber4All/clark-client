import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { router } from 'app/onion/learning-object-builder/components/content-upload/app/content-upload.routes';

@Injectable({
  providedIn: 'root'
})
export class RouteBackwardsCompatGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      const cuidRegex = /([a-z0-9]){8}-([a-z0-9]){4}-([a-z0-9]){4}-([a-z0-9]){4}-([a-z0-9]){12}/;
      console.log(next.params.learningObjectName.search(cuidRegex));
      if (next.params.learningObjectName.search(cuidRegex) === 0) {
        return true;
      } else {
        // Route home first, change to found cuid later
        return this.router.createUrlTree(['']);
      }
  }
  
}
