import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LearningObjectRatingsComponent } from './learning-object-ratings.component';

describe('LearningObjectRatingsComponent', () => {
  let component: LearningObjectRatingsComponent;
  let fixture: ComponentFixture<LearningObjectRatingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LearningObjectRatingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LearningObjectRatingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
