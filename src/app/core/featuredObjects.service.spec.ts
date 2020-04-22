import { TestBed } from '@angular/core/testing';

import { FeaturedObjectsService } from './featuredObjects.service';

describe('FeaturedService', () => {
  let service: FeaturedObjectsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FeaturedObjectsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
