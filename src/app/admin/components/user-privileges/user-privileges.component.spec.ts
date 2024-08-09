import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserPrivilegesComponent } from './user-privileges.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CollectionService } from 'app/core/collection-module/collections.service';
import { HttpClientModule } from '@angular/common/http';
import { PrivilegeService } from 'app/admin/core/privilege.service';
import { ToastrOvenService } from 'app/shared/modules/toaster/notification.service';
import { AuthUser } from 'app/core/auth-module/auth.service';

describe('UserPrivilegesComponent', () => {
  let component: UserPrivilegesComponent;
  let fixture: ComponentFixture<UserPrivilegesComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    declarations: [UserPrivilegesComponent],
    imports: [HttpClientModule],
    providers: [
        CollectionService,
        PrivilegeService,
        ToastrOvenService
    ],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserPrivilegesComponent);
    component = fixture.componentInstance;
    component.user = new AuthUser();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
