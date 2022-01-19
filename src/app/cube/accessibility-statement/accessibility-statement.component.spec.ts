import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccessibilityStatementComponent } from './accessibility-statement.component';

describe('AccessibilityStatementComponent', () => {
  let component: AccessibilityStatementComponent;
  let fixture: ComponentFixture<AccessibilityStatementComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [AccessibilityStatementComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccessibilityStatementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
