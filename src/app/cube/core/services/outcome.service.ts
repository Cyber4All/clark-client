import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Headers, Http, Response } from '@angular/http';
import * as querystring from 'query-string';

@Injectable()
export class OutcomeService {

  private headers: Headers = new Headers();

  constructor(public http: Http) {
    this.headers.append('Content-Type', 'application/json');
  }

  getOutcomes(filter?): Promise<{}[]> {
    const query = querystring.stringify(this.formatFilter(filter));
    return this.http.get(environment.suggestionUrl + '/outcomes?' + query, { headers: this.headers })
      .toPromise()
      .then(res => {
        console.log('results', res.json());
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
