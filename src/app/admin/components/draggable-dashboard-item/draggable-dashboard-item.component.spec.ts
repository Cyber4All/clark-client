import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { DraggableDashboardItemComponent } from './draggable-dashboard-item.component';

describe('DraggableDashboardItemComponent', () => {
  let component: DraggableDashboardItemComponent;
  let fixture: ComponentFixture<DraggableDashboardItemComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [DraggableDashboardItemComponent],
    teardown: { destroyAfterEach: false }
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
