import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { CollectionNcyteComponent } from './collection-ncyte.component';

describe('CollectionNcyteComponent', () => {
  let component: CollectionNcyteComponent;
  let fixture: ComponentFixture<CollectionNcyteComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [CollectionNcyteComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CollectionNcyteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
