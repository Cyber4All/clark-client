import { ConfigService } from './config.service';
import { Injectable, OnInit } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import * as Fuse from 'fuse.js';

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
    console.log(this.config.env.apiUrl);
    this.http.get(this.config.env.apiUrl).subscribe(res => {
      this.groups = res.json();
      for (const g of this.groups) {
        this.fuseGroup.push(new Fuse(g.learningObjects, this.options));
      }
      this.dataObserver.next(this.groups);
    });
  }
}
