import { TestBed, inject, ComponentFixture } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { CookieService, CookieOptionsProvider, CookieModule } from 'ngx-cookie';
import { UserService } from '../../../core/user.service';
import { HttpModule } from '@angular/http';
import { NotificationService } from '../../../shared/notifications';
import { UserEditInformationComponent } from './user-edit-information.component';
import { AuthService } from '../../../core/auth.service';


describe('UserEditInformationComponent', () => {
  let component: UserEditInformationComponent;
  let fixture: ComponentFixture<UserEditInformationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpModule, HttpClientModule, CookieModule.forRoot()],
      providers: [CookieService, UserService, AuthService, CookieOptionsProvider, NotificationService],
      declarations: [ UserEditInformationComponent ]
    })
    .compileComponents();
  });

  test('snapshot of user-edit', () => {
    fixture = TestBed.createComponent(UserEditInformationComponent);
    // component = fixture.componentInstance;
    fixture.detectChanges();

    expect(fixture).toMatchSnapshot();
  });
});
