import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { retry } from 'rxjs/internal/operators/retry';
import { Organization } from '../../entity/organization';
import { ORGANIZATION_ROUTES } from '@env/route';
import { AuthService } from './auth.service';
@Injectable({
  providedIn: 'root'
})
export class OrganizationService {

  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) {}

  async searchOrgs(query: string): Promise<Array<Organization>> {
    return new Promise((resolve, reject) => {
      this.http
        .get(ORGANIZATION_ROUTES.SEARCH_ORGANIZATIONS(query))
        .pipe(retry(3))
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

