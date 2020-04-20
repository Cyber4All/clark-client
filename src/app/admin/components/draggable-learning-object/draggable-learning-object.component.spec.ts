import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DraggableLearningObjectComponent } from './draggable-learning-object.component';

describe('DraggableLearningObjectComponent', () => {
  let component: DraggableLearningObjectComponent;
  let fixture: ComponentFixture<DraggableLearningObjectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DraggableLearningObjectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DraggableLearningObjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
