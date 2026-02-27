import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Organization } from '../organization-module/organization.types';
import { UTILITY_ROUTES } from './utility.routes';

@Injectable({
  providedIn: 'root',
})
export class OrganizationService {
  constructor(private http: HttpClient) { }

  searchOrgs(query: string): Observable<Array<Organization>> {
    return this.http.get<Array<Organization>>(UTILITY_ROUTES.SEARCH_ORGANIZATIONS(query));
  }
}
