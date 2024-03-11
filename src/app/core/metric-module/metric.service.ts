/* eslint-disable @typescript-eslint/naming-convention */
import { Injectable } from '@angular/core';
import { METRIC_ROUTES } from './metric.routes';
import { catchError, retry } from 'rxjs/operators';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import { LearningObjectStats, UserMetrics } from 'app/cube/shared/types/usage-stats';
import { LEGACY_PUBLIC_LEARNING_OBJECT_ROUTES } from '../learning-object-module/learning-object/learning-object.routes';

interface BloomsDistribution {
  blooms_distribution: {
    remember: number;
    apply: number;
    evaluate: number;
  };
}

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
   * Get metrics for a learning object
   * @returns Metrics for one learning object or all released learning objects
   */
  async getLearningObjectStats(): Promise<LearningObjectStats> {
    const [objects, library] = await Promise.all([
      this.http
        .get<Partial<LearningObjectStats> & BloomsDistribution>(LEGACY_PUBLIC_LEARNING_OBJECT_ROUTES.GET_LEARNING_OBJECT_STATS())
        .pipe(
          catchError(this.handleError)
        )
        .toPromise(),
      this.http
        .get<{ metrics: any }>(METRIC_ROUTES.GET_LEARNING_OBJECT_METRICS())
        .pipe(
          catchError(this.handleError)
        )
        .toPromise()
    ]);

    // map service data to LearningObjectStats object
    objects.outcomes = {
      remember_and_understand: objects.blooms_distribution.remember,
      apply_and_analyze: objects.blooms_distribution.apply,
      evaluate_and_synthesize: objects.blooms_distribution.evaluate,
    };

    delete objects.blooms_distribution;
    return { ...objects, ...library.metrics } as LearningObjectStats;
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
