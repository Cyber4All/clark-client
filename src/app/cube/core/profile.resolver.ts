import { User } from '@entity';
import { AuthService } from '../../core/auth.service';
import {
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Resolve,
  Router
} from '@angular/router';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ProfileService } from 'app/core/profiles.service';

@Injectable()
export class ProfileResovler implements Resolve<User> {
  constructor(
    private auth: AuthService,
    private profileService: ProfileService,
    private router: Router
  ) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<any> | Promise<any> | any {
    return this.profileService.fetchUserProfile(route.params.username).then(val => {
      if (val) {
        return val;
      } else {
        this.router.navigate(['/home']);
      }
    });
  }
}
