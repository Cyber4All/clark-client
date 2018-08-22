import { User } from '@cyber4all/clark-entity';
import { AuthService } from '../../core/auth.service';
import {
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Resolve,
  Router
} from '@angular/router';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { USER_ROUTES } from '@env/route';
import { UserService } from '../../core/user.service';
import { LearningObjectService } from '../learning-object.service';

@Injectable()
export class UserProfileLearningObjectsResolver implements Resolve<any> {
  constructor(
    private learningObjectService: LearningObjectService,
    private authService: AuthService
  ) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<any> | Promise<any> | any {
    const username = this.authService.username;
    return username
      ? this.learningObjectService
          .getUsersLearningObjects(username)
          .then(learningObjects => {
            return learningObjects;
          })
          .catch(err => {
            console.log(err);
          })
      : null;
  }
}
