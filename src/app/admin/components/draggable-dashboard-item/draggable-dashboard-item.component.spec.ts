import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DraggableDashboardItemComponent } from './draggable-dashboard-item.component';

describe('DraggableDashboardItemComponent', () => {
  let component: DraggableDashboardItemComponent;
  let fixture: ComponentFixture<DraggableDashboardItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DraggableDashboardItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DraggableDashboardItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
