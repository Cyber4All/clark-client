import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { router } from 'app/onion/learning-object-builder/components/content-upload/app/content-upload.routes';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root'
})
export class RouteBackwardsCompatGuard implements CanActivate {

  constructor(private router: Router, private http: HttpClient) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      const cuidRegex = /([a-z0-9]){8}-([a-z0-9]){4}-([a-z0-9]){4}-([a-z0-9]){4}-([a-z0-9]){12}/;
      if (next.params.learningObjectName.search(cuidRegex) === 0) {
        return true;
      } else {
        // http://localhost:4200/details/kkuczynski/Principles%20of%20Cyber%20Law%20and%20Policy
        return this.http.get(`${environment.apiURL}}/learning-objects/${next.params.username}/${next.params.learningObjectName}`, { withCredentials: false }).toPromise().then(cuid => {
          return this.router.createUrlTree([`/details/${next.params.username}/${cuid}`]);
        }).catch(err => {
          console.error(err);
          // TODO: Route to Not Found page instead of home
          return this.router.createUrlTree(['']);
        });
      }
  }
  
}
