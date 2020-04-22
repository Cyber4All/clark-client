import { TestBed } from '@angular/core/testing';

import { FeaturedService } from './featured.service';

describe('FeaturedService', () => {
  let service: FeaturedService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FeaturedService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
