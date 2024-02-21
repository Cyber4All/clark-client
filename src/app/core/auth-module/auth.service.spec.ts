import { AuthService, AUTH_GROUP } from './auth.service';
import { CookieModule, CookieService } from 'ngx-cookie';
import { FeaturedComponent } from 'app/cube/shared/featured/featured.component';
import { TestBed, fakeAsync, tick, inject } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
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
        AuthService.prototype.validateAndRefreshToken = () => Promise.resolve();
        TestBed.configureTestingModule({
            providers: [AuthService],
            imports: [
                HttpClientTestingModule, CookieModule.forRoot()
            ],
            teardown: { destroyAfterEach: false }
        });
        // Returns a service with the MockBackend so we can test with dummy responses
        service = TestBed.inject(AuthService);
        // Inject the http service and test controller for each test
        httpTestingController = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpTestingController.verify();
    });

    describe('hasViewableAccess', () => {
        it('should return true since the access group is admin',
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
                service.login({ username: 'randomname', password: 'randompsswd' });

                const req = httpTestingController.expectOne(
                    environment.apiURL + '/users/tokens'
                );

                expect(req.request.method).toEqual('POST');
                // Respond with this data when called
                req.flush(response);

                tick();

                const group = service.hasEditorAccess();
                expect(group).toBe(true);

            }));

        it('should return true since the access group is editor',
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
                service.login({ username: 'randomname', password: 'randompsswd' });

                const req = httpTestingController.expectOne(
                    environment.apiURL + '/users/tokens'
                );

                expect(req.request.method).toEqual('POST');
                // Respond with this data when called
                req.flush(response);

                tick();

                const group = service.hasEditorAccess();
                expect(group).toBe(true);

            }));

        it('should return false since the access group is reviewer',
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
                service.login({ username: 'randomname', password: 'randompsswd' });

                const req = httpTestingController.expectOne(
                    environment.apiURL + '/users/tokens'
                );

                expect(req.request.method).toEqual('POST');
                // Respond with this data when called
                req.flush(response);

                tick();

                const group = service.hasEditorAccess();
                expect(group).toBe(false);

            }));

        it('should return false since the access group is user',
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
                service.login({ username: 'randomname', password: 'randompsswd' });

                const req = httpTestingController.expectOne(
                    environment.apiURL + '/users/tokens'
                );

                expect(req.request.method).toEqual('POST');
                // Respond with this data when called
                req.flush(response);

                tick();

                const group = service.hasEditorAccess();
                expect(group).toBe(false);

            }));

        it('should return false since the access group is not valid',
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
                service.login({ username: 'randomname', password: 'randompsswd' });

                const req = httpTestingController.expectOne(
                    environment.apiURL + '/users/tokens'
                );

                expect(req.request.method).toEqual('POST');
                // Respond with this data when called
                req.flush(response);

                tick();

                const group = service.hasEditorAccess();
                expect(group).toBe(false);

            }));

    });


});
