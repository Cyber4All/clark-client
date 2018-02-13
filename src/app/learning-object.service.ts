import { PUBLIC_LEARNING_OBJECT_ROUTES } from './../environments/route';
import { ConfigService } from './config.service';
import { Injectable, OnInit } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import * as Fuse from 'fuse.js';
import { environment } from '../environments/environment';
import { LearningObject, User } from '@cyber4all/clark-entity';
import { Query, TextQuery, MappingQuery } from './shared/interfaces/query';

import * as querystring from 'querystring';

@Injectable()
export class LearningObjectService {

  fuse;
  filteredResults;
  dataObserver;
  data;

  public totalLearningObjects: number;

  constructor(private config: ConfigService, private http: Http, ) { }

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
      let queryString = querystring.stringify(query);
      console.log(queryString);
      route = PUBLIC_LEARNING_OBJECT_ROUTES.GET_PUBLIC_LEARNING_OBJECTS_WITH_FILTER(queryString);
      console.log(route);
    } else {
      route = PUBLIC_LEARNING_OBJECT_ROUTES.GET_PUBLIC_LEARNING_OBJECTS;
    }
    return this.http.get(route)
      .toPromise()
      .then((response) => {
        let res = response.json();
        let objects = res.objects;
        this.totalLearningObjects = res.total;
        return objects.map((_learningObject: string) => {
          let learningObject = LearningObject.unserialize(_learningObject);
          return learningObject;
        });
      });
  }


  /**
   * Fetches LearningObject by id
   * 
   * @param {string} id 
   * @returns {Promise<LearningObject>} 
   * @memberof LearningObjectService
   */
  getLearningObject(author: string, learningObjectName: string): Promise<LearningObject> {
    let route = PUBLIC_LEARNING_OBJECT_ROUTES.GET_PUBLIC_LEARNING_OBJECT(author, learningObjectName);
    return this.http.get(route)
      .toPromise()
      .then((learningObject) => {
        return learningObject ? LearningObject.unserialize(learningObject.json().object) : null;
      });
  }

}