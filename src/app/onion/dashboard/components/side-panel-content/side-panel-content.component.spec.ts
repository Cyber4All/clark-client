import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SidePanelContentComponent } from './side-panel-content.component';

describe('SidePanelContentComponent', () => {
  let component: SidePanelContentComponent;
  let fixture: ComponentFixture<SidePanelContentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SidePanelContentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SidePanelContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
