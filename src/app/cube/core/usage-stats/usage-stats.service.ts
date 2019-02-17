import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { STATS_ROUTES } from '@env/route';
import { LearningObjectStats, UserStats } from 'app/cube/shared/types';

@Injectable()
export class UsageStatsService {
  constructor(private http: HttpClient) {}

  async getLearningObjectStats(): Promise<LearningObjectStats> {
    const [objects, library] = await Promise.all([
      this.http
        .get<Partial<LearningObjectStats>>(STATS_ROUTES.LEARNING_OBJECT_STATS)
        .toPromise(),
      this.http
        .get<{ saves: number; downloads: number }>(STATS_ROUTES.LIBRARY_STATS)
        .toPromise()
    ]);
    return { ...objects, ...library } as LearningObjectStats;
  }
  getUserStats(): Promise<UserStats> {
    return this.http.get<UserStats>(STATS_ROUTES.USERS_STATS).toPromise();
  }
}
