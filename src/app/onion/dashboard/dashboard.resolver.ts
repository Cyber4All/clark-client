import { User } from '@cyber4all/clark-entity';
import { AuthService } from '../../core/auth.service';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Resolve, Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { USER_ROUTES } from '@env/route';
import { UserService } from '../../core/user.service';
import { LearningObjectService } from '../core/learning-object.service';

@Injectable()
export class DashboardResolver implements Resolve<any> {

  constructor(private learningObjectService: LearningObjectService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any>|Promise<any>|any {
    return this.learningObjectService
      .getLearningObjects()
      .then(learningObjects => {
        return learningObjects;
      });
  }
}
