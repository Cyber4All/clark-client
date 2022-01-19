import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { DraggableLearningObjectComponent } from './draggable-learning-object.component';

describe('DraggableLearningObjectComponent', () => {
  let component: DraggableLearningObjectComponent;
  let fixture: ComponentFixture<DraggableLearningObjectComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [DraggableLearningObjectComponent],
    teardown: { destroyAfterEach: false }
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
