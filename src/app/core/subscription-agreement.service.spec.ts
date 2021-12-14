import { TestBed } from '@angular/core/testing';

import { SubscriptionAgreementService } from './subscription-agreement.service';

describe('SubscriptionAgreementService', () => {
  let service: SubscriptionAgreementService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SubscriptionAgreementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
