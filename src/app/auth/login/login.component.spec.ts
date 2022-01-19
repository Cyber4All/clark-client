import {ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthService } from '../../core/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { LoginComponent } from './login.component';
import { FormsModule } from '@angular/forms';
import { NavbarService } from 'app/core/navbar.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  const authServiceStub = {
    validate: (callback) => callback(),
  };
  const navbarServiceStub = {
    hide: () => { },
  };
  const activatedRouteStub = {
    parent: {
      data: {
        subscribe: (cb) => cb()
      }
    },
    snapshot: {
      queryParams: {
        redirectUrl: '',
      }
    }
  };

  beforeEach(async () => {
    TestBed.configureTestingModule({
    imports: [FormsModule],
    providers: [
        { provide: AuthService, useValue: authServiceStub },
        { provide: ActivatedRoute, useValue: activatedRouteStub, },
        { provide: Router, useValue: {} },
        { provide: NavbarService, useValue: navbarServiceStub },
    ],
    declarations: [LoginComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
