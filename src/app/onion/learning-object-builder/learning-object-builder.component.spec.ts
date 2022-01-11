import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { LearningObjectBuilderComponent } from './learning-object-builder.component';

describe('LearningObjectBuilderComponent', () => {
  let component: LearningObjectBuilderComponent;
  let fixture: ComponentFixture<LearningObjectBuilderComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ LearningObjectBuilderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LearningObjectBuilderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
