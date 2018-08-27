import { ActivatedRouteSnapshot, RouterStateSnapshot, Resolve } from '@angular/router';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
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
