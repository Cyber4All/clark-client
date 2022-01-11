import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrivilegesListComponent } from './privileges-list.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('PrivilegesListComponent', () => {
  let component: PrivilegesListComponent;
  let fixture: ComponentFixture<PrivilegesListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [ PrivilegesListComponent ],
      imports: [ NoopAnimationsModule ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrivilegesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
