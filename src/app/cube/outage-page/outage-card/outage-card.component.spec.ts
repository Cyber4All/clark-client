import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OutageCardComponent } from './outage-card.component';

describe('OutageCardComponent', () => {
  let component: OutageCardComponent;
  let fixture: ComponentFixture<OutageCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OutageCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OutageCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
