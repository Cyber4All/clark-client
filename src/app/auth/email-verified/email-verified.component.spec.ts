import { waitForAsync, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';

import { EmailVerifiedComponent } from './email-verified.component';
import { AuthService } from 'app/core/auth.service';
import { NavbarService } from 'app/core/navbar.service';

const promise = {
  then: (callback) => callback(),
  catch: (error) => promise,
};

const authServiceStub = {
  validateAndRefreshToken: (callback) => promise,
  refreshToken: () => promise,
};
const navbarServiceStub = {
  hide: () => {},
};

describe('ForgotPasswordComponent', () => {
  let component: EmailVerifiedComponent;
  let fixture: ComponentFixture<EmailVerifiedComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
    declarations: [EmailVerifiedComponent],
    providers: [
        { provide: AuthService, useValue: authServiceStub },
        { provide: NavbarService, useValue: navbarServiceStub },
    ],
    teardown: { destroyAfterEach: false }
}).compileComponents();
  });

  beforeEach(async () => {
    fixture = TestBed.createComponent(EmailVerifiedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set loading to false when component initialization completes', fakeAsync(() => {
    component.ngOnInit();
    tick();
    expect(component.isLoading).toBeFalsy();
  }));

  it('should set hasValidToken to true when component initialization completes', fakeAsync(() => {
    component.ngOnInit();
    tick();
    expect(component.hasValidToken).toBeTruthy();
  }));
});
