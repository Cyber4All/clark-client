import { Observable } from 'rxjs/Observable';
import { LearningObject } from '@cyber4all/clark-entity';
import { Injectable, Output } from '@angular/core';
import { Headers, Http, Response } from '@angular/http';
import 'rxjs/add/operator/map';
import { Subject } from 'rxjs/Subject';
import { environment } from '@env/environment';
import * as querystring from 'querystring';

@Injectable()
export class SuggestionService {
  suggestion = new Subject<{}[]>();
  mappedStandards = [];
  mappedSubject = new Subject<{}[]>();
  delete: Subject<string> = new Subject<string>();
  total = 0;

  // String of current text used to filter outcomes
  filterText = '';


  // String of currently selected author
  author = '';

  private headers = new Headers();

  constructor(public http: Http) {
    this.headers.append('Content-Type', 'application/json');
  }

  observe(): Observable<{}> {
    return this.suggestion.asObservable();
  }

  get mappings() {
    return {
      observable: this.mappedSubject.asObservable(),
      currentValue: this.mappedStandards,
      total: this.total
    };
  }

  emit(text, filter?) {
    const query = `text=${text}&${querystring.stringify(
      this.formatFilter(filter)
    )}`;
    this.http
      .get(`${environment.suggestionUrl}/outcomes/suggest?${query}`, {
        headers: this.headers
      })
      .toPromise()
      .then(res => {
        const outcomes = res.json().outcomes;
        if (res.ok) {
          this.total = Math.ceil(res.json().total / +filter.limit);
          this.suggestion.next(outcomes);
        }
      });
  }

  private formatFilter(filter) {
    if (!filter) {
      return {};
    }

    return {
      author: filter.author !== 'All' ? filter.author : undefined,
      date: filter.date !== 'Any' ? filter.date : undefined,
      name: filter.name !== '' ? filter.name : undefined,
      page: filter.page,
      limit: filter.limit
    };
  }

  addMapping(s): boolean {
    // Filter the array so that any outcomes with ide
    if (
      this.mappedStandards.filter(outcome => {
        return outcome.id === s.id;
      }).length === 0
    ) {
      // Add standard to the array of mapped standards
      this.mappedStandards.push(s);
      this.mappedSubject.next(this.mappedStandards);
      return true;
    }
    return false;
  }

  removeMapping(s): boolean {
    const index = this.mappedStandards
      .map(x => {
        return x.id;
      })
      .indexOf(s.id);

    if (index >= 0) {
      this.mappedStandards.splice(index, 1);
      this.mappedSubject.next(this.mappedStandards);
      return true;
    }
    return false;
  }

  udpateMappings(mappings) {
    this.mappedStandards = mappings;
    this.mappedSubject.next(mappings);
  }
}
