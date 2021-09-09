import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEvaluatorComponent } from './add-evaluator.component';

describe('AddEvaluatorComponent', () => {
  let component: AddEvaluatorComponent;
  let fixture: ComponentFixture<AddEvaluatorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddEvaluatorComponent ]
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
