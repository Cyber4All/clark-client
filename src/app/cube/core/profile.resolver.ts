import { User } from '@entity';
import {
  ActivatedRouteSnapshot,
  Resolve,
  Router
} from '@angular/router';
import { Injectable } from '@angular/core';
import { ProfileService } from 'app/core/profiles.service';

@Injectable()
export class ProfileResovler implements Resolve<User> {
  constructor(
    private profileService: ProfileService,
    private router: Router
  ) {}

  async resolve(
    route: ActivatedRouteSnapshot,
  ): Promise<any> {
    // Retrieves user profile object
    return await this.profileService.fetchUserProfile(route.params.username).then(val => {
      return val;
    })
    .catch(() => {
      // Routes to 404 not-found
      this.router.navigate(['users']);
    });
  }
}
