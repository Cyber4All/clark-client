import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailVerifiedComponent } from './email-verified.component';

describe('EmailVerifiedComponent', () => {
  let component: EmailVerifiedComponent;
  let fixture: ComponentFixture<EmailVerifiedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmailVerifiedComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmailVerifiedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
