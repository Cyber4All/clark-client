import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserSearchWrapperComponent } from './user-search-wrapper.component';

describe('UserSearchWrapperComponent', () => {
  let component: UserSearchWrapperComponent;
  let fixture: ComponentFixture<UserSearchWrapperComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserSearchWrapperComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserSearchWrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
