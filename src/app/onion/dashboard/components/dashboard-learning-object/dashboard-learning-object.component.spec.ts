import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardLearningObjectComponent } from './dashboard-learning-object.component';

describe('DashboardLearningObjectComponent', () => {
  let component: DashboardLearningObjectComponent;
  let fixture: ComponentFixture<DashboardLearningObjectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashboardLearningObjectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardLearningObjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
