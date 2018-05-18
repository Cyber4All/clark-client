import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelEditChildrenComponent } from './panel-edit-children.component';

describe('PanelEditChildrenComponent', () => {
  let component: PanelEditChildrenComponent;
  let fixture: ComponentFixture<PanelEditChildrenComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PanelEditChildrenComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PanelEditChildrenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
