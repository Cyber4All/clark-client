import { Injectable } from '@angular/core';
import { ACCESS_GROUP_ROUTES } from './access-group.routes';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../auth-module/auth.service';
import { User } from '@entity';
import { catchError, retry } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AccessGroupService {
  constructor(private http: HttpClient, private auth: AuthService) { }

  /**
   * Fetch a list of user's who are reviewers for the given collection
   *
   * @param {string} collection
   * @param {*} role
   * @returns {Promise<User[]>}
   * @memberof UserService
   */
  fetchReviewers(collection: string): Promise<User[]> {
    return this.http
      .get(ACCESS_GROUP_ROUTES.FETCH_MEMBERS(collection), {
        withCredentials: true,
      })
      .pipe(catchError(this.handleError))
      .toPromise()
      .then((val: any) => {
        const arr = val;
        return arr.map((member) => new User(member));
      });
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
