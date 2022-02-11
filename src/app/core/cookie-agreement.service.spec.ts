import { TestBed } from '@angular/core/testing';

import { CookieAgreementService } from './cookie-agreement.service';

describe('CookieAgreementService', () => {
  let service: CookieAgreementService;

  beforeEach(() => {
    TestBed.configureTestingModule({ teardown: { destroyAfterEach: false } });
    service = TestBed.inject(CookieAgreementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
