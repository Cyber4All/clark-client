import { TestBed, waitForAsync, inject } from '@angular/core/testing';
import { UserService } from '../../core/user.service';
import { ProfileGuard } from './profile.guard';
import { Router, ActivatedRoute } from '@angular/router';

describe('ProfileGuard', () => {
  const mockRouter = {
    navigate: jasmine.createSpy()
  };
  beforeEach(() => {
    TestBed.configureTestingModule({
    providers: [
        { provide: Router, useValue: mockRouter },
        ActivatedRoute
    ],
    imports: [ProfileGuard],
    teardown: { destroyAfterEach: false }
});
  });

  it('should ...', inject([ProfileGuard], (guard: ProfileGuard) => {
    expect(guard).toBeTruthy();
  }));
});
