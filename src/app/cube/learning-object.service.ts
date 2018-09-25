import { PUBLIC_LEARNING_OBJECT_ROUTES, USER_ROUTES } from '@env/route';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { LearningObject, User } from '@cyber4all/clark-entity';
import { Query } from '../shared/interfaces/query';

import * as querystring from 'querystring';

// TODO: move to core module
@Injectable()
export class LearningObjectService {
  filteredResults;
  dataObserver;
  data;

  public totalLearningObjects: number;

  constructor(private http: HttpClient) {}

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
      if (
        queryClone.standardOutcomes &&
        queryClone.standardOutcomes.length &&
        typeof queryClone.standardOutcomes[0] !== 'string'
      ) {
        queryClone.standardOutcomes = (<string[]>(
          queryClone.standardOutcomes
        )).map(o => o['id']);
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
      .then((response: any) => {
        const objects = response.objects;
        this.totalLearningObjects = response.total;
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
      .then((res: any) => {
        const learningObject = LearningObject.instantiate(res);
        // If contributors exist on this learning object, instantiate them
        if (learningObject['contributors'] && learningObject['contributors'].length > 0) {
          const arr = learningObject['contributors'];
          learningObject['contributors'] = arr.map((member: any) => User.instantiate(member));
        }
        return learningObject;
      });
  }
  getUsersLearningObjects(username: string): Promise<LearningObject[]> {
    const route = PUBLIC_LEARNING_OBJECT_ROUTES.GET_USERS_PUBLIC_LEARNING_OBJECTS(
      username
    );

    return this.http
      .get(route, { withCredentials: true })
      .toPromise()
      .then((val: any) => {
        return val
          .map(l => LearningObject.instantiate(l));
      });
  }
}
