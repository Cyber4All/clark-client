import { TestBed, inject } from '@angular/core/testing';

import { OutcomeService } from './outcome.service';

describe('OutcomeService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [OutcomeService]
    });
  });

  it('should be created', inject([OutcomeService], (service: OutcomeService) => {
    expect(service).toBeTruthy();
  }));
});
