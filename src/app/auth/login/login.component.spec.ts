import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthService } from '../../core/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { LoginComponent } from './login.component';
import { CookieService } from 'ngx-cookie';
import { HttpClientModule } from '@angular/common/http';
import { of } from 'rxjs';
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
        { provide: Router, useValue: {  } },
        { provide: NavbarService, useValue: navbarServiceStub },
      ],
      declarations: [LoginComponent]
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
