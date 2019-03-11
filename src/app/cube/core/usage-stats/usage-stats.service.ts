import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { STATS_ROUTES } from '@env/route';
import { LearningObjectStats, UserStats } from 'app/cube/shared/types/usage-stats';
import { retry, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Collection } from '@cyber4all/clark-entity';

@Injectable()
export class UsageStatsService {
  constructor(private http: HttpClient) {}

  async getLearningObjectStats(): Promise<LearningObjectStats> {
    const [objects, library] = await Promise.all([
      this.http
        .get<Partial<LearningObjectStats>>(STATS_ROUTES.LEARNING_OBJECT_STATS)
        .pipe(
          retry(3),
          catchError(this.handleError)
        )
        .toPromise(),
      this.http
        .get<{ saves: number; downloads: number }>(STATS_ROUTES.LIBRARY_STATS)
        .pipe(
          retry(3),
          catchError(this.handleError)
        )
        .toPromise()
    ]);
    // @ts-ignore
    return { ...objects, ...library } as  LearningObjectStats & CollectionStats;
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
