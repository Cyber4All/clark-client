import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent
} from '@angular/common/http';

import { Observable } from 'rxjs/Observable';
import { CookieService } from 'ngx-cookie';

@Injectable()
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
    headers = headers.append('Authorization', `Bearer ${this.token}`);

    request = request.clone({
      headers,
      withCredentials: true
    });

    return next.handle(request);
  }
}
