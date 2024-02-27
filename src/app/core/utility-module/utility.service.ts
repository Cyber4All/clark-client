import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UTILITY_ROUTES } from './utility.routes';
import { AuthService } from '../auth-module/auth.service';
import { Observable, throwError } from 'rxjs';
import { Blog } from 'app/components/blogs/types/blog';
import { catchError, retry } from 'rxjs/operators';

@Injectable()
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
   * Posts a blog
   *
   * @param {Blog} blog
   */
  postBlog(blog: Blog): Promise<Blog> {
    return this.http.post<Blog>(UTILITY_ROUTES.POST_BLOGS(), blog).toPromise();
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
        .pipe(retry(3))
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
