import { TestBed, inject } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { HttpClientModule } from '@angular/common/http';
import { CookieService, CookieOptionsProvider, CookieModule } from 'ngx-cookie';

import { Router } from '@angular/router';

describe('AuthService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule, CookieModule.forRoot()],
      providers: [CookieService, AuthService, CookieOptionsProvider]
    });
  });

  // Initial test to check if service is created.
  it('should be created', inject([AuthService], (service: AuthService) => {
    expect(service).toBeTruthy();
  }));
  // login before running other tests
  it('should login and return a user', inject([AuthService], (service: AuthService) => {
    const loginInfo = {
      username: 'nvisal1',
      password: '122595'
    };
    return service.login(loginInfo).then(val => {
      expect(val).toMatchObject( {
        _username: 'nvisal1',
        _name: 'nick visalli',
        _email: 'nvisal1@students.towson.edu',
        _organization: 'Barstow Community College',
        _password: '$2b$04$.Hezd2.hD2CSN7D6tYil/u84Aehmcq8ftly4HD6T7WSaroOw3zYaC',
        _objects: [],
        emailVerified: true,
        bio: '' });
    });
  }));
  it('should return a name', inject([AuthService], (service: AuthService) => {
    const loginInfo = {
      username: 'nvisal1',
      password: '122595'
    };
   return service.login(loginInfo).then(val => {
    const name = service.name;
    expect(name).toBe('nick visalli');
   });
  }));
  it('should return a first name', inject([AuthService], (service: AuthService) => {
    const loginInfo = {
      username: 'nvisal1',
      password: '122595'
    };
    return service.login(loginInfo).then(val => {
      const name = service.firstName;
      expect(name).toBe('nick');
    });
  }));
  it('should return an email', inject([AuthService], (service: AuthService) => {
    const loginInfo = {
      username: 'nvisal1',
      password: '122595'
    };
    return service.login(loginInfo).then(val => {
      const email = service.email;
      expect(email).toBe('nvisal1@students.towson.edu');
    });
  }));
  it('should return status true because logged in', inject([AuthService], (service: AuthService) => {
    const loginInfo = {
      username: 'nvisal1',
      password: '122595'
    };
    return service.login(loginInfo).then(val => {
      const status = service.status;
      expect(status).toBe(true);
    });
  }));
  // it('should return status false because logged out', inject([AuthService], (service: AuthService) => {
  //   const loginInfo = {
  //     username: 'nvisal1',
  //     password: '122595'
  //   };
  //   return service.login(loginInfo).then(val => {
  //     return service.logout().then(val => {
  //       const status = service.status;
  //       expect(status).toBe(false);
  //     });
  //   });
  // }));
  it('should return username', inject([AuthService], (service: AuthService) => {
    const loginInfo = {
      username: 'nvisal1',
      password: '122595'
    };
    return service.login(loginInfo).then(val => {
      const username = service.username;
      expect(username).toBe('nvisal1');
    });
  }));
  it('should return user', inject([AuthService], (service: AuthService) => {
    const loginInfo = {
      username: 'nvisal1',
      password: '122595'
    };
    return service.login(loginInfo).then(val => {
      return service.checkPassword(loginInfo).then(val => {
        console.log('hello');
        expect(val).toBe(true);
      });
    });
  }));
});

