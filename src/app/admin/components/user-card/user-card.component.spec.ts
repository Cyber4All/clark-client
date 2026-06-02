import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminUserCardComponent } from './user-card.component';
import { UserService } from 'app/core/user-module/user.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { AuthService } from 'app/core/auth-module/auth.service';
import { User } from '@entity';

describe('UserCardComponent', () => {
  let component: AdminUserCardComponent;
  let fixture: ComponentFixture<AdminUserCardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [AdminUserCardComponent],
      teardown: { destroyAfterEach: false },
      providers: [
        AuthService,
        UserService,
        provideHttpClient(withInterceptorsFromDi())
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminUserCardComponent);
    component = fixture.componentInstance;
    component.user = new User();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
