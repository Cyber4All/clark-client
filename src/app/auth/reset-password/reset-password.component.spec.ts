import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { ResetPasswordComponent } from './reset-password.component';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from 'app/core/auth.service';

describe('ResetPasswordComponent', () => {
  let component: ResetPasswordComponent;
  let fixture: ComponentFixture<ResetPasswordComponent>;
  const activatedRouteStub = {
    queryParams: {
      _value: {
        otaCode: '',
      },
    }
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [FormsModule],
    providers: [
        { provide: AuthService, useValue: {} },
        { provide: ActivatedRoute, useValue: activatedRouteStub, },
        { provide: Router, useValue: {} },
    ],
    declarations: [ResetPasswordComponent],
    teardown: { destroyAfterEach: false }
})
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResetPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});


