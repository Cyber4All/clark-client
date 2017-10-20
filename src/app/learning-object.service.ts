import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

@Injectable()
export class LearningObjectService {
  constructor(private http: Http) { }

  openLearningObject(url: string) {
    // location.href = url;
    window.open(url);
  }
}
