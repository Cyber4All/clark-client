import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Headers, Http, Response } from '@angular/http';
import { AuthenticationService } from '../../cube/auth/services/authentication.service';

@Injectable()
export class OutcomeService {

  private headers: Headers = new Headers();

  constructor(public http: Http) {
    this.headers.append('Content-Type', 'application/json');
  }

  getOutcomes(filter?): Promise<{}[]> {
    console.log('filter', filter);
    return this.http.post(environment.suggestionUrl + '/suggestOutcomes',
      { text: (filter.filterText) ? filter.filterText : '', filter: this.formatFilter(filter) }, { headers: this.headers })
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
      name: filter.name !== '' ? filter.name : undefined
    };
  }

}
