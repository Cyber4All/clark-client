import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { REPORT_ROUTES } from './report.routes';

@Injectable({
  providedIn: 'root'
})
export class ReportService {

  constructor(
    private http: HttpClient,
    private headers: HttpHeaders = new HttpHeaders()
  ) {}

  async generateCollectionReport(
    collections: string[],
    email: string,
    name: string,
    date?: {
      start: string,
      end: string
    }) {
    if (collections.length > 0) {
      this.http
        .post(REPORT_ROUTES.GENERATE_REPORT(collections, date),
          {
            email,
            name
          },
          { headers: this.headers, withCredentials: true }
        )
        .pipe(
          catchError(this.handleError)
        )
        .toPromise();
    }
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
