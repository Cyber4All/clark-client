import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentWrapperComponent } from './content-wrapper.component';

describe('ContentWrapperComponent', () => {
  let component: ContentWrapperComponent;
  let fixture: ComponentFixture<ContentWrapperComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContentWrapperComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentWrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
