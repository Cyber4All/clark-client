import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { STATS_ROUTES } from '@env/route';
import { LearningObjectStats, UserStats } from 'app/cube/shared/types/usage-stats';
import { retry, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

interface BloomsDistribution {
  blooms_distribution: {
    remember: number;
    apply: number;
    evaluate: number;
  }
}

@Injectable()
export class UsageStatsService {
  constructor(private http: HttpClient) {}

  async getLearningObjectStats(): Promise<LearningObjectStats> {
    const [objects, library] = await Promise.all([
      this.http
        .get<Partial<LearningObjectStats> & BloomsDistribution>(STATS_ROUTES.LEARNING_OBJECT_STATS)
        .pipe(
          retry(3),
          catchError(this.handleError)
        )
        .toPromise(),
      this.http
        .get<{metrics: any}>(STATS_ROUTES.LIBRARY_METRICS)
        .pipe(
          retry(3),
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
    return { ...objects, ...library.metrics } as  LearningObjectStats;
  }
  getUserStats(): Promise<UserStats> {
    return this.http.get<UserStats>(STATS_ROUTES.USERS_STATS)
    .pipe(
      retry(3),
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
