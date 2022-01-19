import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { RevisionComponent } from './revision.component';

describe('RevisionComponent', () => {
  let component: RevisionComponent;
  let fixture: ComponentFixture<RevisionComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [RevisionComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RevisionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
