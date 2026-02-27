import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { environment } from '@env/environment';
import { CookieService } from 'ngx-cookie-service';
import { Observable } from 'rxjs';

/**
 * HTTP interceptor that adds authentication and credentials to API requests
 */
@Injectable({
  providedIn: 'root'
})
export class HttpConfigInterceptor implements HttpInterceptor {
  constructor(private readonly cookie: CookieService) { }

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // Check if this is an API request
    const isApiRequest = this.isApiRequest(request.url);

    if (!isApiRequest) {
      // Not an API request, pass through unchanged
      return next.handle(request);
    }

    // Read token fresh for each request
    const token = this.cookie.get('presence');

    // Check if this is a public endpoint
    const isPublicEndpoint = this.isPublicEndpoint(request);

    // Clone request with withCredentials (MUST be set as option, not header)
    let updatedRequest = request.clone({
      withCredentials: true,
    });

    // Add Authorization header only for non-public endpoints when token exists.
    if (!isPublicEndpoint && token) {
      updatedRequest = updatedRequest.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
    }

    return next.handle(updatedRequest);
  }

  /**
   * Check if URL is an API request (starts with apiURL or cardUrl)
   */
  private isApiRequest(url: string): boolean {
    return url.startsWith(environment.apiURL) || url.startsWith(environment.cardUrl);
  }

  /**
   * Check if URL matches a public endpoint (no auth required).
   * Uses method + path matching to avoid unintentionally allowing
   * authenticated routes like /organizations/:id.
   */
  private isPublicEndpoint(request: HttpRequest<any>): boolean {
    const path = this.getPathname(request.url);
    const method = request.method.toUpperCase();

    if (request.url.startsWith(environment.apiURL) && method === 'GET') {
      return path === '/organizations/suggest';
    }

    if (request.url.startsWith(environment.cardUrl) && method === 'GET') {
      return path.startsWith('/resources');
    }

    return false;
  }

  /**
   * Extract pathname from URL without query params.
   */
  private getPathname(url: string): string {
    try {
      return new URL(url).pathname;
    } catch {
      const withoutQuery = url.split('?')[0];
      const apiIndex = withoutQuery.indexOf(environment.apiURL);
      if (apiIndex === 0) {
        return withoutQuery.slice(environment.apiURL.length) || '/';
      }
      const cardIndex = withoutQuery.indexOf(environment.cardUrl);
      if (cardIndex === 0) {
        return withoutQuery.slice(environment.cardUrl.length) || '/';
      }
      return withoutQuery;
    }
  }

}
