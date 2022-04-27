import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderInfo502Component } from './header-info.component';

describe('HeaderInfoComponent', () => {
  let component: HeaderInfo502Component;
  let fixture: ComponentFixture<HeaderInfo502Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HeaderInfo502Component ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderInfo502Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
