import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewFileBrowserComponent } from './new-file-browser.component';

describe('NewFileBrowserComponent', () => {
  let component: NewFileBrowserComponent;
  let fixture: ComponentFixture<NewFileBrowserComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewFileBrowserComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewFileBrowserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
