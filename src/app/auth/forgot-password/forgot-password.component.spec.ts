import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { ForgotPasswordComponent } from './forgot-password.component';
import { FormsModule } from '@angular/forms';
import { AuthService } from 'app/core/auth.service';

describe('ForgotPasswordComponent', () => {
  let component: ForgotPasswordComponent;
  let fixture: ComponentFixture<ForgotPasswordComponent>;

  const authServiceStub = {
    validate: (callback) => callback(),
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ForgotPasswordComponent ],
      providers: [
        { provide: AuthService, useValue: authServiceStub },
      ],
      imports: [FormsModule]
    })
    .compileComponents();
  }));

  beforeEach(async() => {
    fixture = TestBed.createComponent(ForgotPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
