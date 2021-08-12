import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OutcomeTypeaheadComponent } from './outcome-typeahead.component';

describe('OutcomeTypeaheadComponent', () => {
  let component: OutcomeTypeaheadComponent;
  let fixture: ComponentFixture<OutcomeTypeaheadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OutcomeTypeaheadComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OutcomeTypeaheadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
