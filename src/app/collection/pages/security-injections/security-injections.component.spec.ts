import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SecurityInjectionsComponent } from './security-injections.component';

describe('SecurityInjectionsComponent', () => {
  let component: SecurityInjectionsComponent;
  let fixture: ComponentFixture<SecurityInjectionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SecurityInjectionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SecurityInjectionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
