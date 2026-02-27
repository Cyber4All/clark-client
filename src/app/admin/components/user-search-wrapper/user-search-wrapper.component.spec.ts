import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserSearchWrapperComponent } from './user-search-wrapper.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserService } from 'app/core/user-module/user.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { AuthService } from 'app/core/auth-module/auth.service';
import { ToastrOvenService } from 'app/shared/modules/toaster/notification.service';
import { Collection } from 'app/core/collection-module/collections.service';

describe('UserSearchWrapperComponent', () => {
  let component: UserSearchWrapperComponent;
  let fixture: ComponentFixture<UserSearchWrapperComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    declarations: [UserSearchWrapperComponent],
    teardown: { destroyAfterEach: false },
    imports: [FormsModule],
    providers: [AuthService, UserService, ToastrOvenService, provideHttpClient(withInterceptorsFromDi())]
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
