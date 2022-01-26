import { TestBed, inject, ComponentFixture } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { CookieService, CookieOptionsProvider, CookieModule } from 'ngx-cookie';
import { UserService } from '../../../core/user.service';
import { ToastrOvenService } from 'app/shared/modules/toaster/notification.service';
import { UserEditInformationComponent } from './user-edit-information.component';
import { AuthService } from '../../../core/auth.service';


describe('UserEditInformationComponent', () => {
  let fixture: ComponentFixture<UserEditInformationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [HttpClientModule, CookieModule.forRoot()],
    providers: [CookieService, UserService, AuthService, CookieOptionsProvider, ToastrOvenService],
    declarations: [UserEditInformationComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  });

  test('snapshot of user-edit', () => {
    fixture = TestBed.createComponent(UserEditInformationComponent);
    fixture.detectChanges();

    expect(fixture).toMatchSnapshot();
  });
});
