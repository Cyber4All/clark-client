import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';
import { ToastrOvenService } from 'app/shared/modules/toaster/notification.service';

@Injectable({
  providedIn: 'root'
})
export class RouteBackwardsCompatGuard implements CanActivate {

  constructor(private router: Router, private http: HttpClient, private toaster: ToastrOvenService) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      if (next.params.learningObjectName.indexOf('-') === 8) {
        return true;
      } else {
        return this.http
          .get(`${environment.apiURL}/learning-objects/${encodeURI(next.params.username)}/${encodeURI(next.params.learningObjectName)}`,
            { withCredentials: true })
          .toPromise().then(cuid => {
          return this.router.createUrlTree([`/details/${next.params.username}/${cuid}`]);
        }).catch(err => {
          this.toaster.error('Error!', `Unable to get Learning Object details.`);
          // TODO: Route to Not Found page instead of home
          return this.router.createUrlTree(['']);
        });
      }
  }

}
