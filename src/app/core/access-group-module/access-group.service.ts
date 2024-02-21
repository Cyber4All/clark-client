import { Injectable } from '@angular/core';
import { ACCESS_GROUP_ROUTES } from './access-group.routes';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../auth-module/auth.service';

@Injectable()
export class AccessGroupService {
  constructor(private http: HttpClient, private auth: AuthService) {}
}
