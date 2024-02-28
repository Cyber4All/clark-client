/* eslint-disable @typescript-eslint/naming-convention */
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { LearningObjectStats, UserStats } from 'app/cube/shared/types/usage-stats';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { METRIC_ROUTES } from 'app/core/metric-module/metric.routes';

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
export class UsageStatsService {
  constructor(private http: HttpClient) { }

  async getLearningObjectStats(): Promise<LearningObjectStats> {
    const [objects, library] = await Promise.all([
      this.http
        .get<Partial<LearningObjectStats> & BloomsDistribution>(METRIC_ROUTES.GET_LEARNING_OBJECT_METRICS())
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
  getUserStats(): Promise<UserStats> {
    return this.http.get<UserStats>(METRIC_ROUTES.GET_USER_METRICS())
      .pipe(

        catchError(this.handleError)
      )
      .toPromise();
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
