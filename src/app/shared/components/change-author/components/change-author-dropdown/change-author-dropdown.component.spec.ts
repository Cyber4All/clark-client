import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeAuthorDropdownComponent } from './change-author-dropdown.component';

describe('ChangeAuthorDropdownComponent', () => {
  let component: ChangeAuthorDropdownComponent;
  let fixture: ComponentFixture<ChangeAuthorDropdownComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChangeAuthorDropdownComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChangeAuthorDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
