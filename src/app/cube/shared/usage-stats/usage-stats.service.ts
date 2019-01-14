import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { STATS_ROUTES } from '@env/route';

@Injectable()
export class UsageStatsService {
  constructor(private http: HttpClient) {}

  getLearningObjectStats(): Promise<any> {
    return this.http.get(STATS_ROUTES.LEARNING_OBJECT_STATS).toPromise();
  }
  getUserStats(): Promise<any> {
    return this.http.get(STATS_ROUTES.USERS_STATS).toPromise();
  }
}
