import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CookiePopupComponent } from './cookie-popup.component';

describe('CookiePopupComponent', () => {
  let component: CookiePopupComponent;
  let fixture: ComponentFixture<CookiePopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CookiePopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CookiePopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
