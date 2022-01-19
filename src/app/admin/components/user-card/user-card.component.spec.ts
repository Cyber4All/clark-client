import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminUserCardComponent } from './user-card.component';
import { UserService } from 'app/core/user.service';
import { HttpClientModule } from '@angular/common/http';
import { CookieModule } from 'ngx-cookie';
import { AuthService } from 'app/core/auth.service';
import { User } from '@entity';

describe('UserCardComponent', () => {
  let component: AdminUserCardComponent;
  let fixture: ComponentFixture<AdminUserCardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [AdminUserCardComponent],
    imports: [HttpClientModule, CookieModule.forRoot()],
    providers: [
        AuthService,
        UserService
    ],
    teardown: { destroyAfterEach: false }
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
