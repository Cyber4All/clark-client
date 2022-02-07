import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { CollectionLearningObjectListComponent } from './collection-learning-object-list.component';

describe('CollectionLearningObjectCardComponent', () => {
  let component: CollectionLearningObjectListComponent;
  let fixture: ComponentFixture<CollectionLearningObjectListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [CollectionLearningObjectListComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CollectionLearningObjectListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
