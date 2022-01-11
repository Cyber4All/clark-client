import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { RelevancyDateComponent } from './relevancy-date.component';

describe('RelevancyDateComponent', () => {
  let component: RelevancyDateComponent;
  let fixture: ComponentFixture<RelevancyDateComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RelevancyDateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RelevancyDateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
