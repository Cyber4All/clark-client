import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { OutcomeTypeaheadComponent } from './outcome-typeahead.component';

describe('TypeaheadComponent', () => {
  let component: OutcomeTypeaheadComponent;
  let fixture: ComponentFixture<OutcomeTypeaheadComponent>;

  beforeEach(waitForAsync(() => {
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
