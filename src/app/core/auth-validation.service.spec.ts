import { TestBed } from '@angular/core/testing';

import { AuthValidationService } from './auth-validation.service';

describe('AuthValidationService', () => {
  let service: AuthValidationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthValidationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
