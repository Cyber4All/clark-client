import { ConfigService } from './config.service';
import { Injectable, OnInit } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import * as Fuse from 'fuse.js';
import { environment } from '../environments/environment';
import { LearningObject } from 'clark-entity';

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

  private learningObjectsURL = '/learning-objects'

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

  getLearningObjects(): Promise<LearningObject[]> {
    console.log(environment.apiURL);
    let route = environment.apiURL + this.learningObjectsURL;

    return this.http.get(route)
      .toPromise()
      .then((learningObjects) => {
        return learningObjects.json().map((learningObject: string) => LearningObject.unserialize(learningObject, null));
      });
  }
}
