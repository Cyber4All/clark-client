/* eslint-disable @typescript-eslint/naming-convention */
import { Injectable } from '@angular/core';
import { METRIC_ROUTES } from './metric.routes';
import { catchError } from 'rxjs/operators';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import { LearningObjectStats, UserMetrics } from 'app/cube/shared/types/usage-stats';

@Injectable({
  providedIn: 'root'
})
export class MetricService {

  constructor(private http: HttpClient) { }

  /**
   * Get metrics for a collection
   * @param collectionAbvName - The abbreviated name of the collection
   * @returns Metrics for the given collection
   */
  getCollectionMetrics(collectionAbvName: string) {
    return this.http.get(METRIC_ROUTES.GET_COLLECTION_METRICS(collectionAbvName))
      .pipe(
        catchError(this.handleError)
      )
      .toPromise();
  }

  /**
   * Gets metrics for all learning objects
   * @returns the stats for learning object lengths, statuses, downloads, and bloom's distribution
   */
  async getLearningObjectStats(): Promise<LearningObjectStats> {
    const stats = await
      this.http
        .get<LearningObjectStats>(METRIC_ROUTES.GET_LEARNING_OBJECT_STATS())
        .pipe(
          catchError(this.handleError)
        )
        .toPromise();
        console.log("client response: ", stats);
    return stats as LearningObjectStats;
  }

  /**
   * Gets the total number of users and organizations in the database
   * @returns UserMetrics object containing the total number of users and organizations
   */
  async getUserMetrics(): Promise<UserMetrics> {
    const userMetrics: { users: number, organizations: number } = await this.http
      .get<{ users: number, organizations: number }>(METRIC_ROUTES.GET_USER_METRICS())
      .pipe(
        catchError(this.handleError)
      )
      .toPromise();
    return { accounts: userMetrics.users, organizations: userMetrics.organizations };
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
