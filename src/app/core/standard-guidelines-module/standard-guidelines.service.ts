import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import * as querystring from 'querystring';
import { throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { STANDARD_GUIDELINES_ROUTES } from './standard-guidelines.routes';
import { FrameworkDocument } from '../../../entity/standard-guidelines/Framework';
import { SearchItemDocument } from '../../../entity/standard-guidelines/search-index';

interface GuidelinesFilter {
  text?: string;
  filterText?: string;
  year?: string;
  levels?: string;
  page?: number;
  limit?: number;
  type?: string;
  frameworks?: string | string[];
  deprecated?: string
}

@Injectable({
  providedIn: 'root',
})
export class GuidelineService {
  constructor(public http: HttpClient) {}

  async getGuidelines(
    filter?: GuidelinesFilter,
  ): Promise<{ total: number; results: SearchItemDocument[] }> {
    try {
      let query = '';
      if (filter) {
        query = querystring.stringify(this.formatFilter(filter));
      }
      // CLARK-SERVICE-FIX: SUPPORT SEARCH QUERY
      const res = await this.http
        .get<{ total: number; results: SearchItemDocument[]; }>(
          STANDARD_GUIDELINES_ROUTES.SEARCH_GUIDELINES(query))
        .pipe(catchError(this.handleError))
        .toPromise();
      return res || { total: 0, results: [] };
    } catch (error) {
      console.warn('Failed to load guidelines:', error);
      // Return empty result on error to prevent app crashes
      return { total: 0, results: [] };
    }
  }

  // CLARK-SERVICE-FIX: SUPPORT SEARCH QUERY
  async getFrameworks(filter?: GuidelinesFilter): Promise<FrameworkDocument[]> {
    try {
      const result = await this.http
        .get<{ total: number; results: FrameworkDocument[] }>(
          STANDARD_GUIDELINES_ROUTES.SEARCH_FRAMEWORKS(filter),
        )
        .pipe(
          catchError(this.handleError),
          map((res) => {
            return res.results;
          }),
        )
        .toPromise();
      return result || [];
    } catch (error) {
      console.warn('Failed to load frameworks:', error);
      // Return empty array on error to prevent app crashes
      return [];
    }
  }

  private formatFilter(filter: GuidelinesFilter) {
    if (!filter) {
      return {};
    }

    return {
      text: filter.text || filter.filterText,
      year: filter.year !== '' ? filter.year : undefined,
      levels: filter?.levels?.length > 0 ? filter.levels : undefined,
      page: filter.page ? filter.page : undefined,
      limit: filter.limit ? filter.limit : undefined,
      type: filter.type !== '' ? filter.type : undefined,
      frameworks: filter.frameworks !== '' ? filter.frameworks : undefined,
      deprecated: filter.deprecated !== '' ? filter.deprecated: 'all'
    };
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side or network returned error
      errorMessage = `Network error: ${error.error.message}`;
    } else {
      // API returned error
      switch (error.status) {
        case 0:
          errorMessage = 'No connection to server';
          break;
        case 404:
          errorMessage = 'Service not found';
          break;
        case 500:
          errorMessage = 'Internal server error';
          break;
        case 504:
          errorMessage = 'Service temporarily unavailable (Gateway Timeout)';
          break;
        default:
          errorMessage = `Server error: ${error.status} ${error.statusText}`;
      }
    }

    console.warn('API Error:', errorMessage, error);
    return throwError(errorMessage);
  }
}
