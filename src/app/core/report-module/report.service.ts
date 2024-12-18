import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { REPORT_ROUTES } from './report.routes';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  headers = new HttpHeaders();

  constructor(
    private http: HttpClient
  ) {}

  async generateCollectionReport(
    collections: string[],
    name: string,
    date?: {
      start: string,
      end: string
    }) {
    if (collections.length > 0) {
          this.http
      .post(REPORT_ROUTES.GENERATE_REPORT(),
        {
          startDate: date.start,
          endDate: date.end,
          collection: collections[0]
        },
        {
          headers: this.headers,
          withCredentials: true,
          responseType: 'blob'
        }
      )
      .pipe(
        catchError(this.handleError)
      )
      .toPromise()
      .then((response: Blob) => {
        // Create a blob from the response
        const blob = new Blob([response], { type: response.type });

        // Generate a URL for the blob
        const url = window.URL.createObjectURL(blob);

        // Create a link element to download the file
        const a = document.createElement('a');
        a.href = url;

        // Set the default file name (adjust as needed)
        a.download = name || `${collections[0]}_from_${date.start}_to_${date.end}`;

        // Append the link, trigger click, and remove it
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        // Revoke the object URL after the download
        window.URL.revokeObjectURL(url);
      })
      .catch(error => {
        console.error('Error generating the report:', error);
      });
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
