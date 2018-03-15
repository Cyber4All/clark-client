import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserEditInformationComponent } from './user-edit-information.component';

describe('UserEditInformationComponent', () => {
  let component: UserEditInformationComponent;
  let fixture: ComponentFixture<UserEditInformationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserEditInformationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserEditInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
