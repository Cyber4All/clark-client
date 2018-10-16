import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StandardOutcomesComponent } from './standard-outcomes.component';

describe('StandardOutcomesComponent', () => {
  let component: StandardOutcomesComponent;
  let fixture: ComponentFixture<StandardOutcomesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StandardOutcomesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StandardOutcomesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
