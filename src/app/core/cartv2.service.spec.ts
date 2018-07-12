import { TestBed, inject } from '@angular/core/testing';
import { CartV2Service, sanitizeFileName } from './cartv2.service';
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
  it('should run update user', inject([CartV2Service], (service: CartV2Service) => {
    expect(service.updateUser()).toBeUndefined();
  }));
  it('should return cart', inject([CartV2Service, AuthService], (service: CartV2Service, auth: AuthService) => {
    const loginInfo = {
      username: 'nvisal1',
      password: '122595'
    };
    return auth.login(loginInfo).then(val => {
      service.updateUser();
      return service.getCart().then(val => {
        console.log(val);
        expect(val).toBeTruthy();
      });
    });
  }));
  it('should return cart', inject([CartV2Service], (service: CartV2Service) => {
    const result = sanitizeFileName('///****hjklkjh!@#$%^&');
    expect(result).toBeDefined();
  }));
});

