import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { HttpClient } from '@angular/common/http';
import * as querystring from 'querystring';
import { LearningObject, StandardOutcome } from '@cyber4all/clark-entity';

@Injectable()
export class OutcomeService {
  constructor(public http: HttpClient) {}

  getOutcomes(
    filter?
  ): Promise<{ total: number; outcomes: StandardOutcome[] }> {
    const query = querystring.stringify(this.formatFilter(filter));
    return this.http
      .get(environment.suggestionUrl + '/outcomes?' + query)
      .toPromise()
      .then((res: any) => {
        return res;
      });
  }

  getSources(): Promise<string[]> {
    return this.http
      .get(environment.suggestionUrl + '/outcomes/sources')
      .toPromise()
      .then((res: any) => res);
  }

  suggestOutcomes(source: LearningObject, filter): Promise<StandardOutcome[]> {
    if (!filter || !filter.text) {
      return Promise.reject('Error! No suggestion text specified!');
    }
    const query = `${querystring.stringify(filter)}`;

    return this.http
      .get(`${environment.suggestionUrl}/outcomes/suggest?${query}`)
      .toPromise()
      .then((res: {total: number, outcomes: any[]}) => {
        return res.outcomes;
      });
  }

  private formatFilter(filter) {
    if (!filter) {
      return {};
    }

    return {
      author: filter.author !== '' ? filter.author : undefined,
      date: filter.date !== '' ? filter.date : undefined,
      name: filter.name !== '' ? filter.name : undefined,
      text: filter.text
    };
  }
}
