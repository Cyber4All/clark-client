import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelOverviewComponent } from './panel-overview.component';

describe('PanelOverviewComponent', () => {
  let component: PanelOverviewComponent;
  let fixture: ComponentFixture<PanelOverviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PanelOverviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PanelOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
