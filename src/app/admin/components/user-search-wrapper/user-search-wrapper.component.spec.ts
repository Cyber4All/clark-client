import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserSearchWrapperComponent } from './user-search-wrapper.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserService } from 'app/core/user.service';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from 'app/core/auth.service';
import { CookieModule } from 'ngx-cookie';
import { ToasterService } from 'app/shared/Shared Modules/toaster';
import { Collection } from 'app/core/collection.service';

describe('UserSearchWrapperComponent', () => {
  let component: UserSearchWrapperComponent;
  let fixture: ComponentFixture<UserSearchWrapperComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [ FormsModule, HttpClientModule, CookieModule.forRoot() ],
      declarations: [ UserSearchWrapperComponent ],
      providers: [ AuthService, UserService, ToasterService ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserSearchWrapperComponent);
    component = fixture.componentInstance;
    component.collection = {} as Collection;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
