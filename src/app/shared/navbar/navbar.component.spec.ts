import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalService } from '../modals';
import { Router, ActivatedRoute } from '@angular/router';
import { CartV2Service } from '../../core/cartv2.service';
import { AuthService } from '../../core/auth.service';
import { NavbarComponent } from './navbar.component';
import { CookieService } from 'ngx-cookie';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpModule } from '@angular/http';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ RouterTestingModule, HttpModule, ActivatedRoute ],
      providers: [ ModalService, CartV2Service, AuthService, CookieService ],
      declarations: [ NavbarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
