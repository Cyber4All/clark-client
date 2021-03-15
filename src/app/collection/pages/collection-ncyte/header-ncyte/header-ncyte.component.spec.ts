import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderNcyteComponent } from './header-ncyte.component';

describe('HeaderNcyteComponent', () => {
  let component: HeaderNcyteComponent;
  let fixture: ComponentFixture<HeaderNcyteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HeaderNcyteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderNcyteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
