import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OutcomesListItemComponent } from './outcomes-list-item.component';

describe('OutcomesListItemComponent', () => {
  let component: OutcomesListItemComponent;
  let fixture: ComponentFixture<OutcomesListItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OutcomesListItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OutcomesListItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
