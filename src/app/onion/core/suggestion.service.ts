import { Observable, Subject, throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { environment } from '@env/environment';
import * as querystring from 'querystring';

@Injectable({
  providedIn: 'root'
})
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

  private headers = new HttpHeaders();

  constructor(public http: HttpClient) {
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
      .pipe(
        retry(3),
        catchError(this.handleError)
      )
      .toPromise()
      .then((res: any) => {
        const outcomes = res.outcomes;
        if (res) {
          this.total = Math.ceil(res.total / +filter.limit);
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

  updateMappings(mappings) {
    this.mappedStandards = mappings;
    this.mappedSubject.next(mappings);
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
