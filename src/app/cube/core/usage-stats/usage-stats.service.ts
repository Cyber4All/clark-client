import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { STATS_ROUTES } from '@env/route';
import { LearningObjectStats, UserStats } from 'app/cube/shared/types';

@Injectable()
export class UsageStatsService {
  constructor(private http: HttpClient) {}

  getLearningObjectStats(): Promise<LearningObjectStats> {
    return this.http
      .get<LearningObjectStats>(STATS_ROUTES.LEARNING_OBJECT_STATS)
      .toPromise();
  }
  getUserStats(): Promise<UserStats> {
    return this.http.get<UserStats>(STATS_ROUTES.USERS_STATS).toPromise();
  }
}
