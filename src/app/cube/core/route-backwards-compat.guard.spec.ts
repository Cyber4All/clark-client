import { TestBed, waitForAsync, inject } from '@angular/core/testing';

import { RouteBackwardsCompatGuard } from './route-backwards-compat.guard';

describe('RouteBackwardsCompatGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
    providers: [RouteBackwardsCompatGuard],
    teardown: { destroyAfterEach: false }
});
  });

  it('should ...', inject([RouteBackwardsCompatGuard], (guard: RouteBackwardsCompatGuard) => {
    expect(guard).toBeTruthy();
  }));
});
