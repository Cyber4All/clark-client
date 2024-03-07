import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UTILITY_ROUTES } from './utility.routes';
import { AuthService } from '../auth-module/auth.service';
import { Observable, throwError } from 'rxjs';
import { Blog } from 'app/components/blogs/types/blog';
import { catchError, retry } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UtilityService {
  constructor(private http: HttpClient, private auth: AuthService) { }

  /**
   * Gets all blogs from the database
   *
   * @returns An observable containing an array of blogs
   */
  getAllBlogs(): Observable<Blog[]> {
    return this.http.get<Blog[]>(UTILITY_ROUTES.GET_BLOGS());
  }

  /**
   * Gets all blogs from the database
   *
   * @returns An observable containing an array of blogs
   */
  async getRecentBlogs(): Observable<Blog[]> {
    await this.http.get(UTILITY_ROUTES.GET_RECENT_BLOGS());
  }

  /**
   * Checks the client's version against the service
   *
   * @returns {Promise<void>}
   * @memberof AuthService
   */
  async checkClientVersion(): Promise<void | Partial<{ message: string }>> {
    // Application version information
    const clientVersion = require('../../../../package.json');
    try {
      await this.http
        .get(UTILITY_ROUTES.GET_CLIENT_VERSION(clientVersion), {
          withCredentials: true,
          responseType: 'text',
        })
        .toPromise();
      return Promise.resolve();
    } catch (error) {
      if (error.status === 426) {
        return Promise.reject(error);
      } else {
        catchError(this.handleError);
      }
    }
  }

  private handleError(error: HttpErrorResponse | any) {
    if (
      error.error instanceof ErrorEvent ||
      (error.error && error.error.message)
    ) {
      // Client-side or network returned error
      return throwError(error.error);
    } else {
      // API returned error
      return throwError(error.error);
    }
  }
}
