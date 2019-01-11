import { AuthService, AUTH_GROUP } from '../core/auth.service';
import { CookieModule, CookieService } from 'ngx-cookie';
import { User } from '@cyber4all/clark-entity';
import { FeaturedComponent } from 'app/cube/shared/featured/featured.component';
import { TestBed, fakeAsync, tick, inject, async } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import { environment } from '@env/environment';

class FakeCookies {
    get(s: string) {
        return 'true';
    }
}

describe('Service : Auth', () => {
    let service: AuthService;
    let httpTestingController: HttpTestingController;
    beforeEach(() => {
        AuthService.prototype.validate = () => Promise.resolve();
        TestBed.configureTestingModule({
            providers: [AuthService],
            imports: [
                HttpClientTestingModule, CookieModule.forRoot()
            ],
        });
                // Returns a service with the MockBackend so we can test with dummy responses
                service = TestBed.get(AuthService);
                // Inject the http service and test controller for each test
                httpTestingController = TestBed.get(HttpTestingController);
    });

    afterEach(() => {
        httpTestingController.verify();
    });

    describe('hasViewableAccess', () => {
        it('should pass since it is an admin with hasViewableAccess marked as true',
            fakeAsync(() => {
                const response = {
                    '_username': 'test',
                    '_name': 'test testing',
                    '_email': 'testing@students.towson.edu',
                    '_organization': 'towson university',
                    '_objects': [],
                    '_bio': '',
                    'emailVerified': true,
                    'accessGroups': [
                        'admin'
                    ]
                };
                service.login({username: 'randomname', password: 'randompsswd'});

                const req = httpTestingController.expectOne(
                    environment.apiURL + '/users/tokens'
                );

                expect(req.request.method).toEqual('POST');
                // Respond with this data when called
                req.flush(response);

                tick();

                const group = service.hasViewableAccess();
                expect(group).toBe(true);

        }));

        it('should fail since it is an admin with hasViewableAccess marked as false',
            fakeAsync(() => {
                const response = {
                    '_username': 'test',
                    '_name': 'test testing',
                    '_email': 'testing@students.towson.edu',
                    '_organization': 'towson university',
                    '_objects': [],
                    '_bio': '',
                    'emailVerified': true,
                    'accessGroups': [
                        'admin'
                    ]
                };
                service.login({username: 'randomname', password: 'randompsswd'});

                const req = httpTestingController.expectOne(
                    environment.apiURL + '/users/tokens'
                );

                expect(req.request.method).toEqual('POST');
                // Respond with this data when called
                req.flush(response);

                tick();

                const group = service.hasViewableAccess();
                expect(group).toBe(false);

        }));

        it('should pass since it is an editor with hasViewableAccess marked as true',
            fakeAsync(() => {
                const response = {
                    '_username': 'test',
                    '_name': 'test testing',
                    '_email': 'testing@students.towson.edu',
                    '_organization': 'towson university',
                    '_objects': [],
                    '_bio': '',
                    'emailVerified': true,
                    'accessGroups': [
                        'editor'
                    ]
                };
                service.login({username: 'randomname', password: 'randompsswd'});

                const req = httpTestingController.expectOne(
                    environment.apiURL + '/users/tokens'
                );

                expect(req.request.method).toEqual('POST');
                // Respond with this data when called
                req.flush(response);

                tick();

                const group = service.hasViewableAccess();
                expect(group).toBe(true);

        }));

        it('should fail since it is an editor with hasViewableAccess marked as false',
            fakeAsync(() => {
                const response = {
                    '_username': 'test',
                    '_name': 'test testing',
                    '_email': 'testing@students.towson.edu',
                    '_organization': 'towson university',
                    '_objects': [],
                    '_bio': '',
                    'emailVerified': true,
                    'accessGroups': [
                        'editor'
                    ]
                };
                service.login({username: 'randomname', password: 'randompsswd'});

                const req = httpTestingController.expectOne(
                    environment.apiURL + '/users/tokens'
                );

                expect(req.request.method).toEqual('POST');
                // Respond with this data when called
                req.flush(response);

                tick();

                const group = service.hasViewableAccess();
                expect(group).toBe(false);

        }));

        it('should fail since it is a reviewer with hasViewableAccess marked as true',
            fakeAsync(() => {
                const response = {
                    '_username': 'test',
                    '_name': 'test testing',
                    '_email': 'testing@students.towson.edu',
                    '_organization': 'towson university',
                    '_objects': [],
                    '_bio': '',
                    'emailVerified': true,
                    'accessGroups': [
                        'reviewer'
                    ]
                };
                service.login({username: 'randomname', password: 'randompsswd'});

                const req = httpTestingController.expectOne(
                    environment.apiURL + '/users/tokens'
                );

                expect(req.request.method).toEqual('POST');
                // Respond with this data when called
                req.flush(response);

                tick();

                const group = service.hasViewableAccess();
                expect(group).toBe(true);

        }));

        it('should pass since it is a reviewer with hasViewableAccess marked as false',
            fakeAsync(() => {
                const response = {
                    '_username': 'test',
                    '_name': 'test testing',
                    '_email': 'testing@students.towson.edu',
                    '_organization': 'towson university',
                    '_objects': [],
                    '_bio': '',
                    'emailVerified': true,
                    'accessGroups': [
                        'reviewer'
                    ]
                };
                service.login({username: 'randomname', password: 'randompsswd'});

                const req = httpTestingController.expectOne(
                    environment.apiURL + '/users/tokens'
                );

                expect(req.request.method).toEqual('POST');
                // Respond with this data when called
                req.flush(response);

                tick();

                const group = service.hasViewableAccess();
                expect(group).toBe(false);

        }));

        it('should fail since it is a user with hasViewableAccess marked as true',
            fakeAsync(() => {
                const response = {
                    '_username': 'test',
                    '_name': 'test testing',
                    '_email': 'testing@students.towson.edu',
                    '_organization': 'towson university',
                    '_objects': [],
                    '_bio': '',
                    'emailVerified': true,
                    'accessGroups': [
                        'user'
                    ]
                };
                service.login({username: 'randomname', password: 'randompsswd'});

                const req = httpTestingController.expectOne(
                    environment.apiURL + '/users/tokens'
                );

                expect(req.request.method).toEqual('POST');
                // Respond with this data when called
                req.flush(response);

                tick();

                const group = service.hasViewableAccess();
                expect(group).toBe(true);

        }));

        it('should pass since it is a user with hasViewableAccess marked as false',
            fakeAsync(() => {
                const response = {
                    '_username': 'test',
                    '_name': 'test testing',
                    '_email': 'testing@students.towson.edu',
                    '_organization': 'towson university',
                    '_objects': [],
                    '_bio': '',
                    'emailVerified': true,
                    'accessGroups': [
                        'user'
                    ]
                };
                service.login({username: 'randomname', password: 'randompsswd'});

                const req = httpTestingController.expectOne(
                    environment.apiURL + '/users/tokens'
                );

                expect(req.request.method).toEqual('POST');
                // Respond with this data when called
                req.flush(response);

                tick();

                const group = service.hasViewableAccess();
                expect(group).toBe(false);

        }));

        it('should fail since it is a visitor with hasViewableAccess marked as true',
            fakeAsync(() => {
                const response = {
                    '_username': 'test',
                    '_name': 'test testing',
                    '_email': 'testing@students.towson.edu',
                    '_organization': 'towson university',
                    '_objects': [],
                    '_bio': '',
                    'emailVerified': true,
                    'accessGroups': [
                        ''
                    ]
                };
                service.login({username: 'randomname', password: 'randompsswd'});

                const req = httpTestingController.expectOne(
                    environment.apiURL + '/users/tokens'
                );

                expect(req.request.method).toEqual('POST');
                // Respond with this data when called
                req.flush(response);

                tick();

                const group = service.hasViewableAccess();
                expect(group).toBe(true);

        }));

        it('should pass since it is a visitor with hasViewableAccess marked as false',
            fakeAsync(() => {
                const response = {
                    '_username': 'test',
                    '_name': 'test testing',
                    '_email': 'testing@students.towson.edu',
                    '_organization': 'towson university',
                    '_objects': [],
                    '_bio': '',
                    'emailVerified': true,
                    'accessGroups': [
                        ''
                    ]
                };
                service.login({username: 'randomname', password: 'randompsswd'});

                const req = httpTestingController.expectOne(
                    environment.apiURL + '/users/tokens'
                );

                expect(req.request.method).toEqual('POST');
                // Respond with this data when called
                req.flush(response);

                tick();

                const group = service.hasViewableAccess();
                expect(group).toBe(false);

        }));

        it('should fail since it is a made up role with hasViewableAccess marked as true',
            fakeAsync(() => {
                const response = {
                    '_username': 'test',
                    '_name': 'test testing',
                    '_email': 'testing@students.towson.edu',
                    '_organization': 'towson university',
                    '_objects': [],
                    '_bio': '',
                    'emailVerified': true,
                    'accessGroups': [
                        'something'
                    ]
                };
                service.login({username: 'randomname', password: 'randompsswd'});

                const req = httpTestingController.expectOne(
                    environment.apiURL + '/users/tokens'
                );

                expect(req.request.method).toEqual('POST');
                // Respond with this data when called
                req.flush(response);

                tick();

                const group = service.hasViewableAccess();
                expect(group).toBe(true);

        }));

        it('should pass since it is a made up role with hasViewableAccess marked as false',
            fakeAsync(() => {
                const response = {
                    '_username': 'test',
                    '_name': 'test testing',
                    '_email': 'testing@students.towson.edu',
                    '_organization': 'towson university',
                    '_objects': [],
                    '_bio': '',
                    'emailVerified': true,
                    'accessGroups': [
                        'something'
                    ]
                };
                service.login({username: 'randomname', password: 'randompsswd'});

                const req = httpTestingController.expectOne(
                    environment.apiURL + '/users/tokens'
                );

                expect(req.request.method).toEqual('POST');
                // Respond with this data when called
                req.flush(response);

                tick();

                const group = service.hasViewableAccess();
                expect(group).toBe(false);

        }));

        });


    });
