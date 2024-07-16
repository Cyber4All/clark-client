import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { retry } from 'rxjs/internal/operators/retry';
import { Organization } from '../../../entity/organization';
import { UTILITY_ROUTES } from './utility.routes';

@Injectable({
  providedIn: 'root',
})
export class OrganizationService {
  constructor(private http: HttpClient) { }

  async searchOrgs(query: string): Promise<Array<Organization>> {
    return new Promise((resolve, reject) => {
      this.http
        .get(UTILITY_ROUTES.SEARCH_ORGANIZATIONS(query))
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
