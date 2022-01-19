import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEvaluatorComponent } from './add-evaluator.component';

describe('AddEvaluatorComponent', () => {
  let component: AddEvaluatorComponent;
  let fixture: ComponentFixture<AddEvaluatorComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [AddEvaluatorComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddEvaluatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
