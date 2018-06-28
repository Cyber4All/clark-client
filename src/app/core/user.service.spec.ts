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
  it('should edit user info', inject([UserService, AuthService], (service: UserService, auth: AuthService) => {
    const loginInfo = {
      username: 'nvisal1',
      password: '122595'
    };
    return auth.login(loginInfo).then(val => {
      const editInfo = {
        name: 'nick visalli',
        email: ' nvisal1@students.towson.edu',
        organization: 'Towson University',
        password: '122595',
        bio: 'TU 2018'
      };
      return service.editUserInfo(editInfo).then(val => {
        console.log('hello');
        expect(val).toBeTruthy();
      });
    });
  }));
  it('should retrieve a user', inject([UserService, AuthService], (service: UserService) => {
    return service.getUser('nvisal1').then(val => {
      expect(val).toMatchObject({
        _username: 'nvisal1',
        _name: 'nick visalli',
        _email: 'nvisal1@students.towson.edu',
        _organization: 'Barstow Community College',
        _password: undefined,
        _objects: [],
        emailVerified: true,
        bio: ''
      });
    });
  }));
  it('should retrieve a gravatar image', inject([UserService, AuthService], (service: UserService) => {
    const img = service.getGravatarImage('nvisal1@students.towson.edu', 200);
      expect(img).toBe('https://www.gravatar.com/avatar/d964e1a74e2c4b5b66b412ab9a3e2690?s=200?r=pg&d=identicon');
  }));
  it('should retrieve an array of users - same organization', inject([UserService, AuthService], (service: UserService) => {
    return service.getOrganizationMembers('Towson University').then(val => {
      expect(val).toBeDefined();
    });
  }));
  it('should retrieve an array of users - search', inject([UserService, AuthService], (service: UserService) => {
    return service.searchUsers({text: 'nick'}).then(val => {
      expect(val).toBeDefined();
    });
  }));
});




// export type UserEdit = {
//   name: string;
//   email: string;
//   organization: string;
//   password: string;
//   bio: string;
// };

// _username: 'nvisal1',
// _name: 'nick visalli',
// _email: 'nvisal1@students.towson.edu',
// _organization: 'Barstow Community College',
// _password: '$2b$04$.Hezd2.hD2CSN7D6tYil/u84Aehmcq8ftly4HD6T7WSaroOw3zYaC',
// _objects: [],
// emailVerified: true,
// bio: '' });
// });