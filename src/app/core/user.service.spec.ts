import { TestBed, inject } from '@angular/core/testing';
import { UserService } from './user.service';
import { HttpClientModule } from '@angular/common/http';
import { CookieService, CookieOptionsProvider, CookieModule } from 'ngx-cookie';

import { Router } from '@angular/router';
import { HttpModule } from '@angular/http';
import { AuthService } from './auth.service';

describe('UserService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpModule, HttpClientModule, CookieModule.forRoot()],
      providers: [CookieService, UserService, AuthService, CookieOptionsProvider]
    });
  });

  it('should be created', inject([UserService], (service: UserService) => {
    expect(service).toBeTruthy();
  }));
});
