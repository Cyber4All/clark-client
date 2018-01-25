import { PUBLIC_LEARNING_OBJECT_ROUTES } from './../environments/route';
import { ConfigService } from './config.service';
import { Injectable, OnInit } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import * as Fuse from 'fuse.js';
import { environment } from '../environments/environment';
import { LearningObject, User } from '@cyber4all/clark-entity';

@Injectable()
export class LearningObjectService {
  options = {
    shouldSort: true,
    threshold: 0.6,
    location: 0,
    distance: 100,
    maxPatternLength: 32,
    minMatchCharLength: 1,
    keys: ['topic']
  };
  fuseGroup = [];
  groups;
  filteredResults;

  dataObserver;
  data;

  constructor(private config: ConfigService, private http: Http) { }

  observeFiltered(): Observable<LearningObject[]> {
    return this.data;
  }

  search(query) {
    this.filteredResults = [];
    for (const g of this.fuseGroup) {
      this.filteredResults.push({
        learningObjects: g.search(query)
      });
    }
    this.dataObserver ? this.dataObserver.next(this.filteredResults) : "Data Observer is undefined!";
  }

  clearSearch() {
    this.filteredResults = [];
    this.dataObserver ? this.dataObserver.next(this.groups) : "Data Observer is undefined!";

  }

  openLearningObject(url: string) {
    // location.href = url;
    window.open(url);
  }

  /**
   * Fetches Array of Learning Objects
   * 
   * @returns {Promise<LearningObject[]>} 
   * @memberof LearningObjectService
   */
  getLearningObjects(limit?: number): Promise<LearningObject[]> {
    let route = PUBLIC_LEARNING_OBJECT_ROUTES.GET_PUBLIC_LEARNING_OBJECTS;
    return this.http.get(route)
      .toPromise()
      .then((learningObjects) => {
        console.log(learningObjects.json());
        let last:number;
        limit ? last = limit : last = learningObjects.json().length
        return learningObjects.json().slice(0, last).map((_learningObject: string) => {
          let object = JSON.parse(_learningObject);
          let learningObject = LearningObject.unserialize(_learningObject);
          learningObject['id'] = object['id'];
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
        console.log(learningObject);
        return learningObject ? LearningObject.unserialize(learningObject.json().object) : null;
      });
  }

  // /**
  //  * Fetches Array of LearningObjects by their id
  //  * 
  //  * @param {string[]} ids 
  //  * @returns {Promise<LearningObject[]>} 
  //  * @memberof LearningObjectService
  //  */
  // getLearningObjectsByIDs(ids: string[]): Promise<LearningObject[]> {
  //   let route = environment.apiURL + this.learningObjectsURL + '/multiple' + `/${ids}`;
  //   console.log(route)
  //   return this.http.get(route)
  //     .toPromise()
  //     .then((learningObjects) => {
  //       return learningObjects.json().map((_learningObject: string) => {
  //         let object = JSON.parse(_learningObject);
  //         let learningObject = LearningObject.unserialize(_learningObject);
  //         learningObject['id'] = object['id'];
  //         return learningObject;
  //       });
  //     });
  // }

}
