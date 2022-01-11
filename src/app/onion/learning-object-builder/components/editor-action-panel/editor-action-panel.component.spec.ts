import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditorActionPanelComponent } from './editor-action-panel.component';

describe('EditorActionPanelComponent', () => {
  let component: EditorActionPanelComponent;
  let fixture: ComponentFixture<EditorActionPanelComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ EditorActionPanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditorActionPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
