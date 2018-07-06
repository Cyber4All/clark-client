import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { Headers, Http, Response } from '@angular/http';
import * as querystring from 'querystring';
import { LearningOutcome } from '@cyber4all/clark-entity';

@Injectable()
export class OutcomeService {

  private headers: Headers = new Headers();

  constructor(public http: Http) {
    this.headers.append('Content-Type', 'application/json');
  }

  getOutcomes(filter?): Promise<{total: number, outcomes: LearningOutcome[]}> {
    const query = querystring.stringify(this.formatFilter(filter));
    return this.http.get(environment.suggestionUrl + '/outcomes?' + query, { headers: this.headers })
      .toPromise()
      .then(res => {
        if (res.ok) {
          return res.json();
        }
      });
  }

  getSources(): Promise<string[]> {
    return this.http.get(environment.suggestionUrl + '/outcomes/sources', { headers: this.headers })
      .toPromise()
      .then(res => {
        console.log(res);
        if (res.ok) {
          return res.json();
        }
      });
  }

  private formatFilter(filter) {
    if (!filter) { return {}; }

    return {
      author: filter.author !== '' ? filter.author : undefined,
      date: filter.date !== '' ? filter.date : undefined,
      name: filter.name !== '' ? filter.name : undefined,
      text: filter.filterText,
    };
  }

}
