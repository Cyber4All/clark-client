import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { LearningObjectService } from 'app/onion/core/learning-object.service';

@Injectable()
export class LearningObjectBuilderGuard implements CanActivate {
  constructor(private learningObjectService: LearningObjectService) { }

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {

    console.log(next.paramMap);

    return this.learningObjectService.getLearningObject(next.paramMap.get('learningObjectId')).then(learningObject => {
      if (learningObject.status && ['published', 'waiting', 'review'].includes(learningObject.status)) {
        return false;
      }
      return true;
    }).catch(error => {
      return false;
    })
  }
}
