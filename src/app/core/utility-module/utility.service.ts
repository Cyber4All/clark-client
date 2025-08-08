import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { Blog } from 'app/components/blogs/types/blog';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../auth-module/auth.service';
import { UTILITY_ROUTES } from './utility.routes';

export class Downtime {
  constructor(public isDown: boolean, public message: string) { }
}

@Injectable({
  providedIn: 'root'
})
export class UtilityService {
  constructor(private http: HttpClient, private auth: AuthService) { }

  private _downtime: Downtime;

  get message() {
    return this._downtime;
  }

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
  getRecentBlogs(): Observable<Blog[]> {
    return this.http.get<Blog[]>(UTILITY_ROUTES.GET_RECENT_BLOGS());
  }

  /**
   * Checks the client's version against the service
   *
   * @returns {Promise<void>}
   * @memberof AuthService
   */
  async checkClientVersion(): Promise<void | Partial<{ message: string }>> {
    // Application version information
    const { version } = require('../../../../package.json');
    try {
      await this.http
        .get(UTILITY_ROUTES.GET_CLIENT_VERSION(version), {
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

  /**
   * Gets all CARD resources
   * @returns list of card resources
   */
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
    try {
      const result = await this.http
        .get(`${environment.cardUrl}/resources`, {})
        .toPromise();
      return result || [];
    } catch (error) {
      console.warn('Failed to load CARD resources:', error);
      // Return empty array on error to prevent app crashes
      return [];
    }
  }

  async getOrganizations(): Promise<any> {
    try {
      const result = await this.http
        .get(`${environment.cardUrl}/organizations`, {})
        .toPromise();
      return result || [];
    } catch (error) {
      console.warn('Failed to load organizations:', error);
      // Return empty array on error to prevent app crashes
      return [];
    }
  }

  async getDowntime(): Promise<Downtime> {
    try {
      const result = await this.http.get(UTILITY_ROUTES.GET_DOWNTIME(), { withCredentials: true })
        .pipe(catchError(this.handleError))
        .toPromise();
      return result as Downtime;
    } catch (error) {
      console.warn('Failed to get downtime information:', error);
      // Return a default downtime object on error
    }
  }

  public openCard() {
    // Ask the user if they are sure they want to leave
    if (confirm('You are now leaving CLARK. You will be redirected to the CAE Resource Directory.')) {
      window.open('https://caeresource.clark.center', '_blank');
    }
  }

  private handleError(error: HttpErrorResponse | any) {
    let errorMessage = 'An unknown error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side or network returned error
      errorMessage = `Network error: ${error.error.message}`;
    } else {
      // API returned error
      switch (error.status) {
        case 0:
          errorMessage = 'No connection to server';
          break;
        case 404:
          errorMessage = 'Service not found';
          break;
        case 500:
          errorMessage = 'Internal server error';
          break;
        case 504:
          errorMessage = 'Service temporarily unavailable (Gateway Timeout)';
          break;
        default:
          errorMessage = `Server error: ${error.status} ${error.statusText}`;
      }
    }

    console.warn('API Error:', errorMessage, error);
    return throwError(errorMessage);
  }
}
