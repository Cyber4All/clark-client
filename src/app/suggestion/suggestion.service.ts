import { SuggestionQuery } from './suggestion.component';
import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Subject } from 'rxjs/Subject';

import * as io from 'socket.io-client';

@Injectable()
export class SuggestionService {
  _db: any;
  socket = io('54.92.208.221:27015');
  suggestion = new Subject<{}[]>();

  constructor(public http: Http) { }

  observe(): Observable<{}> {
    return this.suggestion.asObservable();
  }
  emit(query: SuggestionQuery) {
    this.socket.emit('suggestOutcomes',
      query.text,
      {
        author: query.filter.author,
        name: '',
        ignoreme: ''
      },
      (outcomes) => {
        console.log(outcomes);
        this.suggestion.next(outcomes);
      }
      );
  }

  getData() {
    return this.http.get('/assets/return.json').map((res: Response) => res.json());
  }
}
