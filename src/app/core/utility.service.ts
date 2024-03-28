import { Injectable } from '@angular/core';
import {
  HttpClient,
} from '@angular/common/http';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root'
})
export class UtilityService {

  constructor(
    private http: HttpClient,
  ) { }

  async getAllResources(args?: {
    q?: string;
    page?: number;
    limit?: number;
    sort?: 1 | -1;
    sortType?: string;
    category?: string[];
    organizations?: string[];
    status?: string[];
  }): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http
        .get(`${environment.cardUrl}/resources`, {})
        .toPromise()
        .then(
          (res: any) => {
            resolve(res);
          },
          (err) => {
            reject(err);
          }
        );
    });
  }

  async getOrganizations(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http
        .get(`${environment.cardUrl}/organizations`, {})
        .toPromise()
        .then(
          (res: any) => {
            resolve(res);
          },
          (err) => {
            reject(err);
          }
        );
    });
  }
}
