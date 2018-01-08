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

  constructor(private config: ConfigService, private http: Http) {
    this.data = new Observable(observer => this.dataObserver = observer);
    this.getGroups();
  }

  observeFiltered(): Observable<{}[]> {
    return this.data;
  }

  search(query) {
    this.filteredResults = [];
    for (const g of this.fuseGroup) {
      this.filteredResults.push({
        learningObjects: g.search(query)
      });
    }
    this.dataObserver.next(this.filteredResults);
  }
  clearSearch() {
    this.filteredResults = [];
    this.dataObserver.next(this.groups);
  }
  openLearningObject(url: string) {
    // location.href = url;
    window.open(url);
  }
  getGroups() {
    console.log(environment.apiURL);
    let route = environment.apiURL + this.learningObjectsURL;
    this.http.get(route).subscribe(res => {
      this.groups = res.json().map((learningObject: string) => { return LearningObject.unserialize(learningObject, null) })
      console.log(this.groups)
      for (const g of this.groups) {
        this.fuseGroup.push(new Fuse(g.learningObjects, this.options));
      }
      this.dataObserver.next(this.groups);
    });
  }
}
