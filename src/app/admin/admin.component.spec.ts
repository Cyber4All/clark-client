import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminComponent } from './admin.component';
import {  ToasterService } from 'app/shared/Shared Modules/toaster';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from 'app/core/auth.service';
import { HttpClientModule } from '@angular/common/http';
import { CookieModule } from 'ngx-cookie';
import { CollectionService } from 'app/core/collection.service';
import { ActivatedRoute, Router, NavigationEnd, Scroll } from '@angular/router';
import { of } from 'rxjs';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('AdminComponent', () => {
  let component: AdminComponent;
  let fixture: ComponentFixture<AdminComponent>;

  class ActivatedRouteStub {
    public snapshot = {
      firstChild: {
        data: {}
      }
    };
    public paramMap = of(new Map());
  }

  const routerStub = {
    navigate: (commands: any[]) => { Promise.resolve(true); },
    events: of(new Scroll(new NavigationEnd(0, 'dummyUrl', 'dummyUrl'), [0, 0], 'dummyString')),
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [AdminComponent],
      imports: [RouterTestingModule, HttpClientModule, CookieModule.forRoot()],
      providers: [
        AuthService,
        ToasterService,
        CollectionService,
        { provide: Router, useValue: routerStub },
        { provide: ActivatedRoute, useClass: ActivatedRouteStub },
      ]
    }).compileComponents();

  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
