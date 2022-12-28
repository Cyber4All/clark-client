import { TestBed } from '@angular/core/testing';
import { FeaturedObjectsService } from './featuredObjects.service';
import { HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing';
import { ProfileService } from './profiles.service';
import { AuthService } from './auth.service';


describe('FeaturedService', () => {
  let featuredObjectsService: FeaturedObjectsService;
  let profileService: ProfileService;
  let authService: AuthService;
  let httpTestingController: HttpTestingController;

  beforeAll(() => {
    TestBed.configureTestingModule({
    imports: [HttpClientTestingModule],
    providers: [FeaturedObjectsService, ProfileService, AuthService],
    teardown: { destroyAfterEach: false }
});

    httpTestingController = TestBed.inject(HttpTestingController);
    featuredObjectsService = TestBed.inject(FeaturedObjectsService);
    profileService = TestBed.inject(ProfileService);
    authService = TestBed.inject(AuthService);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be ', () => {
    expect(featuredObjectsService).toBeTruthy();
  });
});
