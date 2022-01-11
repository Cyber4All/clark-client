import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { ObjectDropdownComponent } from './object-dropdown.component';

describe('ObjectDropdownComponent', () => {
  let component: ObjectDropdownComponent;
  let fixture: ComponentFixture<ObjectDropdownComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ObjectDropdownComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ObjectDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
