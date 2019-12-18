import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportRatingComponent } from './report-rating.component';

describe('ReportRatingComponent', () => {
  let component: ReportRatingComponent;
  let fixture: ComponentFixture<ReportRatingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReportRatingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportRatingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
