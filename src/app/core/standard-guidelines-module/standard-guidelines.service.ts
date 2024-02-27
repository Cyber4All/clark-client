import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import * as querystring from 'querystring';
import { throwError } from 'rxjs';
import { retry, catchError, map } from 'rxjs/operators';
import { STANDARD_GUIDELINES_ROUTES } from './standard-guidelines.routes';
import { FrameworkDocument } from '../../../entity/standard-guidelines/Framework';
import { SearchItemDocument } from '../../../entity/standard-guidelines/search-index';

@Injectable({
  providedIn: 'root'
})
export class GuidelineService {

  constructor(public http: HttpClient) { }

  getGuidelines(
    filter?
  ): Promise<{ total: number; results: SearchItemDocument[] }> {
    let query = '';
    if (filter) {
      query = querystring.stringify(this.formatFilter(filter));
    }
    // CLARK-SERVICE-FIX: SUPPORT SEARCH QUERY
    return this.http
      .get<{ total: number, results: SearchItemDocument[] }>(STANDARD_GUIDELINES_ROUTES.SEARCH_GUIDELINES())
      .pipe(
        retry(3),
        catchError(this.handleError)
      )
      .toPromise()
      .then((res: { total: number, results: any[] }) => {
        return res;
      });
  }

  // CLARK-SERVICE-FIX: SUPPORT SEARCH QUERY
  async getFrameworks(query?: any): Promise<FrameworkDocument[]> {
    return this.http
      .get<{ total: number, results: FrameworkDocument[] }>(STANDARD_GUIDELINES_ROUTES.SEARCH_FRAMEWORKS())
      .pipe(
        retry(3),
        catchError(this.handleError),
        map((res) => {
          return res.results;
        })
      ).toPromise();
  }

  private formatFilter(filter) {
    if (!filter) {
      return {};
    }

    return {
      text: filter.text || filter.filterText,
      year: filter.year !== '' ? filter.year : undefined,
      levels: filter?.levels?.length > 0 ? filter.levels : undefined,
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
