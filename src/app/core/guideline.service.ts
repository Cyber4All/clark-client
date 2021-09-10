import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import * as querystring from 'querystring';
import { throwError, Observable } from 'rxjs';
import { retry, catchError, map } from 'rxjs/operators';
import { STANDARD_GUIDELINE_ROUTES } from '@env/route';
import { FrameworkDocument } from '../../entity/standard-guidelines/Framework';
import { SearchItemDocument } from '../../entity/standard-guidelines/search-index';

@Injectable()
export class GuidelineService {

  private sources: Observable<string[]>;

  constructor(public http: HttpClient) {
    // Load guideline sources only once
    this.sources = this.http
      .get<{total: number, results: FrameworkDocument[]}>(STANDARD_GUIDELINE_ROUTES.SEARCH_FRAMEWORKS({page: '1', limit: '20'}))
      .pipe(
        retry(3),
        catchError(this.handleError),
        map((response) => {
          // This should be removed once guidelines begin to be added
          let sources = response.results.map(res => res.name);
          sources = sources.filter(source => source !== 'CAE CDE 2019');
          return sources;
        })
      );
  }

  getGuidelines(
    filter?
  ): Promise<{ total: number; results: SearchItemDocument[] }> {
    let query = '';
    if (filter) {
      query = querystring.stringify(this.formatFilter(filter));
    }
    return this.http
      .get<{total: number, results: SearchItemDocument[]}>(STANDARD_GUIDELINE_ROUTES.SEARCH_GUIDELINES(query))
      .pipe(
        retry(3),
        catchError(this.handleError)
      )
      .toPromise()
      .then((res: {total: number, results: any[]}) => {
        const searchItems = res.results.filter(searchItem => {
          if (searchItem.frameworkName !== 'CAE CDE 2019') {
            return searchItem;
          }
        });
        res.results = searchItems;
        return res;
      });
  }

  async getFrameworks(): Promise<FrameworkDocument[]> {
    return this.http
      .get<{total: number, results: FrameworkDocument[]}>(STANDARD_GUIDELINE_ROUTES.SEARCH_FRAMEWORKS({}))
      .pipe(
        retry(3),
        catchError(this.handleError),
        map((res) => {
          return res.results.filter(framework => framework.name !== 'CAE CDE 2019');
        })
      ).toPromise();
  }

  getSources(): Observable<string[]> {
    return this.sources;
  }

  private formatFilter(filter) {
    if (!filter) {
      return {};
    }

    return {
      text: filter.text || filter.filterText,
      year: filter.year !== '' ? filter.year : undefined,
      levels: filter.levels !== [] ? filter.levels : undefined,
      page: filter.page !== '' ? filter.page : undefined,
      limit: filter.limit !== '' ? filter.limit : undefined,
      type: filter.type !== '' ? filter.type : undefined,
      frameworks: filter.frameworks !== '' ? filter.frameworks : undefined,
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
