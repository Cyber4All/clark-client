import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LearningObjectInfoComponent } from './learning-object-info.component';

describe('LearningObjectInfoComponent', () => {
  let component: LearningObjectInfoComponent;
  let fixture: ComponentFixture<LearningObjectInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LearningObjectInfoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LearningObjectInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
