import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserPrivilegesComponent } from './user-privileges.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CollectionService } from 'app/core/collection.service';
import { HttpClientModule } from '@angular/common/http';
import { PrivilegeService } from 'app/admin/core/privilege.service';
import { ToasterService } from 'app/shared/modules/toaster';
import { AuthUser } from 'app/core/auth.service';

describe('UserPrivilegesComponent', () => {
  let component: UserPrivilegesComponent;
  let fixture: ComponentFixture<UserPrivilegesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [ UserPrivilegesComponent ],
      imports: [ HttpClientModule ],
      providers: [
        CollectionService,
        PrivilegeService,
        ToasterService
      ]
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
