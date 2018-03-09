import { Observable } from 'rxjs/Observable';
import { LearningObject } from '@cyber4all/clark-entity';
import { Injectable, Output } from '@angular/core';
import { Headers, Http, Response } from '@angular/http';
import 'rxjs/add/operator/map';
import { Subject } from 'rxjs/Subject';
import { environment } from '@env/environment';

@Injectable()
export class SuggestionService {

  suggestion = new Subject<{}[]>();
  mappedStandards = [];
  @Output() mappedSubject = new Subject<{}[]>();
  @Output() delete: Subject<string> = new Subject<string>();

  private headers = new Headers();

  constructor(public http: Http) {
    this.headers.append('Content-Type', 'application/json');
  }

  observe(): Observable<{}> {
    return this.suggestion.asObservable();
  }

  get mappings() {
    return this.mappedSubject.asObservable();
  }

  emit(text, filter?) {
    console.log('url', environment.suggestionUrl + '/suggestOutcomes', text);
    this.http.post(environment.suggestionUrl + '/suggestOutcomes',
      { text: text, filter: this.formatFilter(filter) }, { headers: this.headers })
      .toPromise()
      .then(res => {
        const outcomes = res.json();
        // FIXME: If alphabetical sorting by author is the normal use case, this sort function should be implemented at the API layer
        outcomes.sort(function (a, b) {
          const textA = a.author.toUpperCase();
          const textB = b.author.toUpperCase();
          return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
        });
        if (res.ok) {
          this.suggestion.next(outcomes);
        }
      });
  }

  private formatFilter(filter) {
    console.log('filter', filter);
    if (!filter) { return {}; }

    return {
      author: filter.author !== 'All' ? filter.author : undefined,
      date: filter.date !== 'Any' ? filter.date : undefined,
      name: filter.name !== '' ? filter.name : undefined
    };
  }

  addMapping(s) {
    // Filter the array so that any outcomes with ide
    if (!(this.mappedStandards.filter(outcome => { return outcome.id === s.id; }).length > 0)) {
      // Add standard to the array of mapped standards
      this.mappedStandards.push(s);
      this.mappedSubject.next(this.mappedStandards);
    }
  }

  removeMapping(s) {
    const index = this.mappedStandards.map((x) => { return x.id; }).indexOf(s.id);
    this.mappedStandards.splice(index, 1);
    this.mappedSubject.next(this.mappedStandards);
  }
}
