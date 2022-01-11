import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { ColumnWrapperComponent } from './column-wrapper.component';

describe('ColumnWrapperComponent', () => {
  let component: ColumnWrapperComponent;
  let fixture: ComponentFixture<ColumnWrapperComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ColumnWrapperComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ColumnWrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
