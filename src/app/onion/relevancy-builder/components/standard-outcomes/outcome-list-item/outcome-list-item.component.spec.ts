import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OutcomeListItemComponent } from './outcome-list-item.component';

describe('OutcomeListItemComponent', () => {
  let component: OutcomeListItemComponent;
  let fixture: ComponentFixture<OutcomeListItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OutcomeListItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OutcomeListItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
