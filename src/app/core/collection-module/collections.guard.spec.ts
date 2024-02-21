import { TestBed } from '@angular/core/testing';

import { CollectionsGuard } from './collections.guard';

describe('CollectionsGuard', () => {
  let guard: CollectionsGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(CollectionsGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
