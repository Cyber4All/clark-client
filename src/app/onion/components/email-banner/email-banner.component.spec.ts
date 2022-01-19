import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailBannerComponent } from './email-banner.component';

describe('EmailBannerComponent', () => {
  let component: EmailBannerComponent;
  let fixture: ComponentFixture<EmailBannerComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [EmailBannerComponent],
    teardown: { destroyAfterEach: false }
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
