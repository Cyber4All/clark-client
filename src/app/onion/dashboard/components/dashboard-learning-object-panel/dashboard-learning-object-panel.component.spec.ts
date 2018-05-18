import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardLearningObjectPanelComponent } from './dashboard-learning-object-panel.component';

describe('DashboardLearningObjectPanelComponent', () => {
  let component: DashboardLearningObjectPanelComponent;
  let fixture: ComponentFixture<DashboardLearningObjectPanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashboardLearningObjectPanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardLearningObjectPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
