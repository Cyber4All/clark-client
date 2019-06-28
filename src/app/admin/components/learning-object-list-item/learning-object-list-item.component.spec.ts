import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LearningObjectListItemComponent } from './learning-object-list-item.component';

describe('DashboardItemComponent', () => {
  let component: LearningObjectListItemComponent;
  let fixture: ComponentFixture<LearningObjectListItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LearningObjectListItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LearningObjectListItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
