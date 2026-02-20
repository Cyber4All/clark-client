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
  /**
   * Public endpoints that don't require authentication
   * Based on path prefixes (not full URLs with query strings)
   */
  private readonly publicEndpoints = [
    `${environment.apiURL}/organizations/suggest`,
    `${environment.apiURL}/organizations`, // search endpoint
    `${environment.cardUrl}/resources`,
  ];

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
    const isPublicEndpoint = this.isPublicEndpoint(request.url);

    // Clone request with withCredentials (MUST be set as option, not header)
    let updatedRequest = request.clone({
      withCredentials: true,
    });

    // Add Authorization header only for non-public endpoints when token exists
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
   * Check if URL matches a public endpoint (no auth required)
   * Uses path prefix matching (not full URL with query strings)
   */
  private isPublicEndpoint(url: string): boolean {
    return this.publicEndpoints.some(endpoint => url.startsWith(endpoint));
  }
}
