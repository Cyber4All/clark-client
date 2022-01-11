import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { HighlightedLearningObjectComponent } from './highlighted-learning-object.component';

describe('HighlightedLearningObjectComponent', () => {
  let component: HighlightedLearningObjectComponent;
  let fixture: ComponentFixture<HighlightedLearningObjectComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ HighlightedLearningObjectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HighlightedLearningObjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
