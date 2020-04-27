import { TestBed } from '@angular/core/testing';

import { FeaturedObjectsService } from './featuredObjects.service';
import { HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing';

describe('FeaturedService', () => {
  let featuredObjectsService: FeaturedObjectsService;
  let httpTestingController: HttpTestingController;

  const mockLearningObjects = [];
  const mockFeatured = [];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule ],
      providers: [ FeaturedObjectsService ]
    });

    httpTestingController = TestBed.get(HttpTestingController);
    featuredObjectsService = TestBed.inject(FeaturedObjectsService);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be ', () => {
    expect(featuredObjectsService).toBeTruthy();
  });
});
