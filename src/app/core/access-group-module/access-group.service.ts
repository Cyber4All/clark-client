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
      .get(ACCESS_GROUP_ROUTES.FETCH_REVIEWERS(collection), {
        withCredentials: true,
      })
      .pipe(catchError(this.handleError))
      .toPromise()
      .then((val: any) => {
        const arr = val;
        return arr.map((member) => new User(member));
      });
  }

  /**
   * Remove a user's privilege from a collection
   *
   * @param {string} collection the collection to remove
   * @param {string} memberId the user who's privilege shall be revoked
   * @returns {Promise<void>}
   * @memberof UserService
   */
    async removeMember(collectionName: string, memberId: string): Promise<void> {
      const collection = collectionName;
      await this.http
        .request(
          ACCESS_GROUP_ROUTES.REMOVE_ACCESS_GROUP_FROM_USER(memberId),
            collection,
          {
            withCredentials: true,
            responseType: 'text',
          }
        )
        .pipe(retry(3), catchError(this.handleError))
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
