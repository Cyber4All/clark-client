import { TestBed } from '@angular/core/testing';

import { RelevancyService } from './relevancy.service';

describe('RelevancyService', () => {
  let service: RelevancyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RelevancyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
