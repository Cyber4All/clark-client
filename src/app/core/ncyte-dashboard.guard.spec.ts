import { TestBed } from '@angular/core/testing';

import { NcyteDashboardGuard } from './ncyte-dashboard.guard';

describe('NcyteDashboardGuard', () => {
  let guard: NcyteDashboardGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(NcyteDashboardGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
