import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IdentificationPillComponent } from './identification-pill.component';

describe('IdentificationPillComponent', () => {
  let component: IdentificationPillComponent;
  let fixture: ComponentFixture<IdentificationPillComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IdentificationPillComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IdentificationPillComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
