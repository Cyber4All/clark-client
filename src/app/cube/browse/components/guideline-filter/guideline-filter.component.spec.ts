import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GuidelineFilterComponent } from './guideline-filter.component';

describe('GuidelineFilterComponent', () => {
  let component: GuidelineFilterComponent;
  let fixture: ComponentFixture<GuidelineFilterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GuidelineFilterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GuidelineFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
