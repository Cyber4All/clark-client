import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PUBLIC_LEARNING_OBJECT_ROUTES } from '@env/route';

@Injectable()
export class IncludedInService {
  constructor(private httpClient: HttpClient) { }

  fetchParents(id: string) {
    return this.httpClient.get(PUBLIC_LEARNING_OBJECT_ROUTES.GET_LEARNING_OBJECT_PARENTS(id))
      .take(1)
      .toPromise();
  }
}
