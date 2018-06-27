import { TestBed, inject } from '@angular/core/testing';
import { CartV2Service } from './cartv2.service';
import { HttpClientModule } from '@angular/common/http';
import { CookieService, CookieOptionsProvider, CookieModule } from 'ngx-cookie';

import { Router } from '@angular/router';
import { HttpModule } from '@angular/http';
import { AuthService } from './auth.service';

describe('CartV2Service', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpModule, HttpClientModule, CookieModule.forRoot()],
      providers: [CookieService, CartV2Service, AuthService, CookieOptionsProvider]
    });
  });

  it('should be created', inject([CartV2Service], (service: CartV2Service) => {
    expect(service).toBeTruthy();
  }));
});
