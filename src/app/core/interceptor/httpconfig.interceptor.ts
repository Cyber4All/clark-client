import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent
} from '@angular/common/http';

import { Observable } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root'
})
export class HttpConfigInterceptor implements HttpInterceptor {
  private token: string;
  constructor(private cookie: CookieService) {
    this.token = this.cookie.get('presence');
  }
  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    let headers = request.headers.set('Content-Type', 'application/json');
    if (
      !request.url.includes(environment.cardOrganizationUrl) &&
      !request.url.includes(environment.cardUrl+ '/resources') &&
      !request.url.includes(environment.cardUrl+ '/organizations')
    ) {
      headers = headers.append('Authorization', `Bearer ${this.token}`);
      headers = headers.append('withCredentials', 'true');
    }

    request = request.clone({
      headers
    });

    return next.handle(request);
  }
}
