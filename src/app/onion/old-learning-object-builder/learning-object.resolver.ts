import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { LearningObjectService } from '../core/learning-object.service';
import { LearningObject } from '@cyber4all/clark-entity';

@Injectable()
export class LearningObjectResolve implements Resolve<LearningObject> {
  constructor(
    private router: Router,
    private loService: LearningObjectService
  ) {}

  /*
  resolve(route: ActivatedRouteSnapshot) {
    if (route.params['learningObjectName']) {
      const name = route.params['learningObjectName'];
      return this.loService.getLearningObject(name).then(learningObject => {
        return learningObject;
      }).catch(err => {
        return undefined;
      });
    } else {
      return new LearningObject();
    }
  } */
}
