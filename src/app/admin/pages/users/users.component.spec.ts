import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { UsersComponent } from './users.component';
import { of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { UserService } from 'app/core/user.service';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ToastrOvenService } from 'app/shared/modules/toaster/notification.service';
import { AuthService } from 'app/core/auth.service';
import { HttpClientModule } from '@angular/common/http';
import { CookieModule } from 'ngx-cookie';
import { CollectionService } from 'app/core/collection.service';

describe('UsersComponent', () => {
  let component: UsersComponent;
  let fixture: ComponentFixture<UsersComponent>;

  class ActivatedRouteStub {
    public parent = {
      params: of({})
    };
  }

  const routerStub = {
    navigate: (commands: any[]) => {
 Promise.resolve(true);
},
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [ UsersComponent ],
      imports: [ RouterTestingModule, HttpClientModule, CookieModule.forRoot() ],
      providers: [
        AuthService,
        ToastrOvenService,
        CollectionService,
        UserService,
        { provide: Router, userValue: routerStub },
        { provide: ActivatedRoute, useClass: ActivatedRouteStub }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
