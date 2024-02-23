import { Injectable } from '@angular/core';
import { METRIC_ROUTES } from './metric.router';
import { catchError, retry } from 'rxjs/operators';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';

@Injectable()
export class MetricService {

  constructor(private http: HttpClient) { }

  getCollectionMetricsData() {
    return this.http.get(METRIC_ROUTES.GET_COLLECTION_METRICS)
      .pipe(
        retry(3),
        catchError(this.handleError)
      )
      .toPromise();
  }


  private handleError(error: HttpErrorResponse | any) {
    if (
      error.error instanceof ErrorEvent ||
      (error.error && error.error.message)
    ) {
      // Client-side or network returned error
      return throwError(error.error);
    } else {
      // API returned error
      return throwError(error.error);
    }
  }
}
