 import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeCollectionComponent } from './change-collection.component';

describe('ChangeCollectionComponent', () => {
  let component: ChangeCollectionComponent;
  let fixture: ComponentFixture<ChangeCollectionComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [ChangeCollectionComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChangeCollectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
