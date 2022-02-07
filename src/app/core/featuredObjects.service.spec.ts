import { TestBed } from '@angular/core/testing';
import { FeaturedObjectsService } from './featuredObjects.service';
import { HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing';


describe('FeaturedService', () => {
  let featuredObjectsService: FeaturedObjectsService;
  let httpTestingController: HttpTestingController;

  beforeAll(() => {
    TestBed.configureTestingModule({
    imports: [HttpClientTestingModule],
    providers: [FeaturedObjectsService],
    teardown: { destroyAfterEach: false }
});

    httpTestingController = TestBed.inject(HttpTestingController);
    featuredObjectsService = TestBed.inject(FeaturedObjectsService);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be ', () => {
    expect(featuredObjectsService).toBeTruthy();
  });
});
