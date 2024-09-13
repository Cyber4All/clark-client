import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LearningObject } from '@entity';
import { Observable, throwError } from 'rxjs';

// TODO: move to core module
@Injectable({
  providedIn: 'root',
})
export class LearningObjectService {
  filteredResults;
  dataObserver;
  data;

  constructor(private http: HttpClient) {}

  observeFiltered(): Observable<LearningObject[]> {
    return this.data;
  }

  getFilteredObjects() {
    return this.filteredResults;
  }

  clearSearch() {
    this.filteredResults = [];
  }

  openLearningObject(url: string) {
    window.open(url);
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
