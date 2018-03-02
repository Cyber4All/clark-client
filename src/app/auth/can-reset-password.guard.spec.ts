import { TestBed, async, inject } from '@angular/core/testing';

import { CanResetPasswordGuard } from './can-reset-password.guard';

describe('CanResetPasswordGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CanResetPasswordGuard]
    });
  });

  it('should ...', inject([CanResetPasswordGuard], (guard: CanResetPasswordGuard) => {
    expect(guard).toBeTruthy();
  }));
});
