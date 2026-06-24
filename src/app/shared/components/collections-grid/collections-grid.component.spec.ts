import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { CollectionsGridComponent } from './collections-grid.component';

describe('CollectionsGridComponent', () => {
  let component: CollectionsGridComponent;
  let fixture: ComponentFixture<CollectionsGridComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [CollectionsGridComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CollectionsGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
