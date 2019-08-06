import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailBannerComponent } from './email-banner.component';

describe('EmailBannerComponent', () => {
  let component: EmailBannerComponent;
  let fixture: ComponentFixture<EmailBannerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmailBannerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmailBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
