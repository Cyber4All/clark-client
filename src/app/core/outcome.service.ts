import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import * as querystring from 'querystring';
import { LearningObject, StandardOutcome } from '@entity';
import { throwError, Observable } from 'rxjs';
import { retry, catchError, map } from 'rxjs/operators';

@Injectable()
export class OutcomeService {

  private sources: Observable<string[]>;

  constructor(public http: HttpClient) {
    // Load guideline sources only once
    this.sources = this.http
      .get<string[]>(environment.suggestionUrl + '/outcomes/sources')
      .pipe(
        retry(3),
        catchError(this.handleError),
        map(sources => sources.filter(source => source !== 'CAE CDE 2019'))
      );
  }

  getOutcomes(
    filter?
  ): Promise<{ total: number; outcomes: StandardOutcome[] }> {
    const query = querystring.stringify(this.formatFilter(filter));
    return this.http
      .get(environment.suggestionUrl + '/outcomes?' + query)
      .pipe(
        retry(3),
        catchError(this.handleError)
      )
      .toPromise()
      .then((res: {total: number, outcomes: any[]}) => {
        const outcomes = res.outcomes.filter(outcome => {
          if (outcome.source !== 'CAE CDE 2019') {
            return outcome;
          }
        });
        res.outcomes = outcomes;
        return res;
      });
  }

  getSources(): Observable<string[]> {
    return this.sources;
  }

  suggestOutcomes(source: LearningObject, filter): Promise<StandardOutcome[]> {
    if (!filter || !filter.text) {
      return Promise.reject('Error! No suggestion text specified!');
    }
    const query = `${querystring.stringify(filter)}`;

    return this.http
      .get(`${environment.suggestionUrl}/outcomes/suggest?${query}`)
      .pipe(
        retry(3),
        catchError(this.handleError)
      )
      .toPromise()
      .then((res: {total: number, outcomes: any[]}) => {
        const outcomes = res.outcomes.filter(outcome => {
          if (outcome.source !== 'CAE CDE 2019') {
            return outcome;
          }
        });
        res.outcomes = outcomes;
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
      text: filter.text || filter.filterText
    };
  }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // Client-side or network returned error
      return throwError(error.error.message);
    } else {
      // API returned error
      return throwError(error);
    }
  }
}
