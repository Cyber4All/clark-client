import { PUBLIC_LEARNING_OBJECT_ROUTES } from './../environments/route';
import { ConfigService } from './config.service';
import { Injectable, OnInit } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import * as Fuse from 'fuse.js';
import { environment } from '../environments/environment';
import { LearningObject, User } from '@cyber4all/clark-entity';
import { MappingQuery } from './filter-menu/filter-menu.component';
import * as querystring from 'querystring';

@Injectable()
export class LearningObjectService {

  fuse;
  filteredResults;
  dataObserver;
  data;

  constructor(private config: ConfigService, private http: Http, ) { }

  observeFiltered(): Observable<LearningObject[]> {
    return this.data;
  }

  async configureFuse(query: String) {
    let fuseGroups = await this.getLearningObjects();
    let options = {
      shouldSort: true,
      threshold: 0.3,
      location: 0,
      distance: 100,
      maxPatternLength: 32,
      minMatchCharLength: 1,
      keys: ['name']
    };
    this.fuse = new Fuse(fuseGroups, options)



  }

  async search(query: String): Promise<LearningObject[]> {
    if (query.length < 4) {
      this.clearSearch()
    } else {
      await this.configureFuse(query);
      this.filteredResults = this.fuse.search(query);
    }
    return this.filteredResults;
  }

  searchByMapping(query: MappingQuery): Promise<LearningObject[]> {
    let queryString = querystring.stringify(query);
    console.log(queryString)
    return this.http.get(PUBLIC_LEARNING_OBJECT_ROUTES.GET_PUBLIC_LEARNING_OBJECTS_WITH_FILTER(queryString))
      .toPromise()
      .then((response) => {
        return response.json().map((object) => LearningObject.unserialize(object));
      });
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
  getLearningObjects(limit?: number): Promise<LearningObject[]> {
    let route = PUBLIC_LEARNING_OBJECT_ROUTES.GET_PUBLIC_LEARNING_OBJECTS;
    return this.http.get(route)
      .toPromise()
      .then((learningObjects) => {
        let last: number;
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
        return learningObject ? LearningObject.unserialize(learningObject.json().object) : null;
      });
  }

}
