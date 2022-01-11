import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionPanelComponent } from './action-panel.component';

describe('ActionPanelComponent', () => {
  let component: ActionPanelComponent;
  let fixture: ComponentFixture<ActionPanelComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ActionPanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActionPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
