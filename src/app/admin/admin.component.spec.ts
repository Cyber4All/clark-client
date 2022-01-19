import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminComponent } from './admin.component';
import {  ToastrOvenService } from 'app/shared/modules/toaster/notification.service';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from 'app/core/auth.service';
import { HttpClientModule } from '@angular/common/http';
import { CookieModule } from 'ngx-cookie';
import { CollectionService } from 'app/core/collection.service';
import { ActivatedRoute, Router, NavigationEnd, Scroll } from '@angular/router';
import { of } from 'rxjs';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MessagesService } from 'app/core/messages.service';

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
    navigate: (commands: any[]) => {
 Promise.resolve(true);
},
    events: of(new Scroll(new NavigationEnd(0, 'dummyUrl', 'dummyUrl'), [0, 0], 'dummyString')),
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [AdminComponent],
      imports: [RouterTestingModule, HttpClientModule, CookieModule.forRoot()],
      providers: [
        AuthService,
        ToastrOvenService,
        CollectionService,
        MessagesService,
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
