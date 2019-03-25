
import { map, take } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PUBLIC_LEARNING_OBJECT_ROUTES } from '@env/route';
import { LearningObject } from '@entity';

@Injectable()
export class IncludedInService {
  constructor(private httpClient: HttpClient) { }

  fetchParents(id: string) {
    return this.httpClient.get<LearningObject[]>(PUBLIC_LEARNING_OBJECT_ROUTES.GET_LEARNING_OBJECT_PARENTS(id))
    .pipe(
      take(1),
      /* TODO: Remove this.
       * It is a stopcap until the service stops returning unreleased.
       * More info at https://github.com/Cyber4All/learning-object-service/pull/282
       */
      map(parents => parents.filter(parent => parent.status !== 'unreleased')),
    )
    .toPromise();
  }
}
