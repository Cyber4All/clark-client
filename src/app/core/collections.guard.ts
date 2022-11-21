import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CollectionsGuard implements CanActivate {
  private paidCollections = ['ncyte', '502-project', 'nice'];

  constructor(private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      // If the collection is a paid collection, navigate to the paid collection page
      if (this.paidCollections.includes(route.params.abvName)) {
        return this.router.createUrlTree(['collections', route.params.abvName]);
      }
      // Else navigate to default page
      return true;
  }
}
