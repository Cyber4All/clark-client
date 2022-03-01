import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditorialProcessComponent } from './editorial-process.component';

describe('EditorialProcessComponent', () => {
  let component: EditorialProcessComponent;
  let fixture: ComponentFixture<EditorialProcessComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditorialProcessComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditorialProcessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
