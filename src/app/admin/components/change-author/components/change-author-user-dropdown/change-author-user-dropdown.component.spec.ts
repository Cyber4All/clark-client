import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeAuthorUserDropdownComponent } from './change-author-user-dropdown.component';

describe('ChangeAuthorUserDropdownComponent', () => {
  let component: ChangeAuthorUserDropdownComponent;
  let fixture: ComponentFixture<ChangeAuthorUserDropdownComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChangeAuthorUserDropdownComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChangeAuthorUserDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
