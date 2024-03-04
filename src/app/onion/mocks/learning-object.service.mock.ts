
import { of as observableOf, Observable } from 'rxjs';
import { LOmocks } from './learning-object.mock';
import { Injectable } from '@angular/core';

import { LearningObject } from '@entity';


@Injectable({
  providedIn: 'root'
})
export class LearningObjectServiceMock {
  learningObjects: LearningObject[] = [];
  constructor() {
    const token = 'test';
  }

  getExisting(): Observable<any> {
    this.learningObjects = LOmocks;
    return observableOf(LOmocks);
  }
  // getPlan(id) {
  //     for (let o of this.learningObjects) {
  //         if (o.id == id) return o;
  //     }
  // }
  save(learningObjectContent) {
    return true;
  }
  create(learningObjectContent) {
    return true;
  }
  delete(learningObjectName: string) {
    return true;
  }
}
