import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { PUBLIC_LEARNING_OBJECT_ROUTES } from '@env/route';
import { LearningObject } from '@cyber4all/clark-entity';
import { Subject } from 'rxjs';

@Injectable()
export class CollectionService {
  collection = new Subject<any>();

  constructor(private http: HttpClient) { }

  fetchCollection(name: string) {
    this.http.get(PUBLIC_LEARNING_OBJECT_ROUTES.GET_COLLECTION(name))
      .toPromise()
      .then((collection: { name: string, learningObjects: Array<any>}) => {
        this.collection.next({
          name: collection.name,
          learningObjects: collection.learningObjects.map(lo => LearningObject.instantiate(lo))
        });
      });
    return this.collection;
  }
}
