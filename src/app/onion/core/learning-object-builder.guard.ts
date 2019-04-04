import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { LearningObjectService } from 'app/onion/core/learning-object.service';
import { LearningObject } from '@entity';

@Injectable()
export class LearningObjectBuilderGuard implements CanActivate {
  constructor(private learningObjectService: LearningObjectService) { }

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {

    return this.learningObjectService.getLearningObject(next.paramMap.get('learningObjectId')).then(learningObject => {
      if (learningObject.status && learningObject.status === LearningObject.Status.RELEASED) {
        return false;
      }
      return true;
    }).catch(error => {
      return false;
    })
  }
}
