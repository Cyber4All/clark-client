import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Headers, Response } from '@angular/http';
import * as querystring from 'querystring';
import { LearningOutcome } from '@cyber4all/clark-entity';

@Injectable()
export class OutcomeService {

  private headers: HttpHeaders = new HttpHeaders();

  constructor(public http: HttpClient) {
    this.headers.append('Content-Type', 'application/json');
  }

  getOutcomes(filter?): Promise<{total: number, outcomes: LearningOutcome[]}> {
    const query = querystring.stringify(this.formatFilter(filter));
    return this.http.get(environment.suggestionUrl + '/outcomes?' + query, { headers: this.headers })
      .toPromise()
      .then((res: any) => {
        if (res.ok) {
          return res;
        }
      });
  }

  getSources(): Promise<string[]> {
    return this.http.get(environment.suggestionUrl + '/outcomes/sources', { headers: this.headers })
      .toPromise()
      .then((res: any) => res);
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
