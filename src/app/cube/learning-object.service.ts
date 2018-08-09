import { PUBLIC_LEARNING_OBJECT_ROUTES } from '@env/route';
import { Injectable, OnInit } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { environment } from '@env/environment';
import { LearningObject} from '@cyber4all/clark-entity';
import { Query } from '../shared/interfaces/query';

import * as querystring from 'querystring';

// TODO: move to core module
@Injectable()
export class LearningObjectService {
  filteredResults;
  dataObserver;
  data;

  public totalLearningObjects: number;

  constructor(private http: Http) {}

  observeFiltered(): Observable<LearningObject[]> {
    return this.data;
  }

  getFilteredObjects() {
    return this.filteredResults;
  }

  clearSearch() {
    this.filteredResults = [];
  }

  openLearningObject(url: string) {
    window.open(url);
  }

  /**
   * Fetches Array of Learning Objects
   *
   * @returns {Promise<LearningObject[]>}
   * @memberof LearningObjectService
   */
  getLearningObjects(query?: Query): Promise<LearningObject[]> {
    let route = '';
    if (query) {
      const queryClone = Object.assign({}, query);
      if (queryClone.standardOutcomes && queryClone.standardOutcomes.length && typeof queryClone.standardOutcomes[0] !== 'string') {
        queryClone.standardOutcomes = (<string[]>queryClone.standardOutcomes).map(
          o => o['id']
        );
      }
      const queryString = querystring.stringify(queryClone);
      route = PUBLIC_LEARNING_OBJECT_ROUTES.GET_PUBLIC_LEARNING_OBJECTS_WITH_FILTER(
        queryString
      );
    } else {
      route = PUBLIC_LEARNING_OBJECT_ROUTES.GET_PUBLIC_LEARNING_OBJECTS;
    }

    return this.http
      .get(route)
      .toPromise()
      .then(response => {
        const res = response.json();
        const objects = res.objects;
        this.totalLearningObjects = res.total;
        return objects.map(object => LearningObject.instantiate(object));
      });
  }

  /**
   * Fetches LearningObject by id
   *
   * @param {string} id
   * @returns {Promise<LearningObject>}
   * @memberof LearningObjectService
   */
  getLearningObject(
    author: string,
    learningObjectName: string
  ): Promise<LearningObject> {
    const route = PUBLIC_LEARNING_OBJECT_ROUTES.GET_PUBLIC_LEARNING_OBJECT(
      author,
      learningObjectName
    );
    return this.http
      .get(route)
      .toPromise()
      .then(res => {
        return LearningObject.instantiate(res.json());
      });
  }
  getUsersLearningObjects(username: string ): Promise<LearningObject[]> {
    let route = PUBLIC_LEARNING_OBJECT_ROUTES.GET_USERS_PUBLIC_LEARNING_OBJECTS(
      username
    );

    return this.http
      .get(route, { withCredentials: true })
      .toPromise()
      .then(val => {
        return val
          .json()
          .map(l => LearningObject.instantiate(l));
      });
  }
}
