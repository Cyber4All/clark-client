import { TestBed } from '@angular/core/testing';

import { BlogRedirectGuard } from './blog-redirect.guard';

describe('BlogRedirectGuard', () => {
  let guard: BlogRedirectGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(BlogRedirectGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
