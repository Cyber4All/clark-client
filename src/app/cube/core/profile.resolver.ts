import { User } from '@entity';
import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { UserService } from 'app/core/user-module/user.service';

@Injectable()
export class ProfileResovler implements Resolve<User> {
  constructor(
    private userService: UserService,
    private router: Router
  ) {}

  async resolve(
    route: ActivatedRouteSnapshot,
  ): Promise<any> {
    // Retrieves user profile object
    return await this.userService.fetchUserProfile(route.params.username).then(val => {
      return val;
    })
    .catch(() => {
      // Routes to 404 not-found
      this.router.navigate(['users']);
    });
  }
}
