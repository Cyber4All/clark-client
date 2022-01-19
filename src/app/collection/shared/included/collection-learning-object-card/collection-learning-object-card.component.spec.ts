import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { CollectionLearningObjectCardComponent } from './collection-learning-object-card.component';

describe('CollectionLearningObjectCardComponent', () => {
  let component: CollectionLearningObjectCardComponent;
  let fixture: ComponentFixture<CollectionLearningObjectCardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [CollectionLearningObjectCardComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CollectionLearningObjectCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
