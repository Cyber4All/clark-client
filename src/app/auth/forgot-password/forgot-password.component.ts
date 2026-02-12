import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { MatchValidator } from 'app/shared/validators/MatchValidator';
import { AuthValidationService } from 'app/core/auth-module/auth-validation.service';
import { AuthService } from 'app/core/auth-module/auth.service';
import { debounce, takeUntil } from 'rxjs/operators';
import { Subject, interval } from 'rxjs';
import { animate, state, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'clark-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
  animations: [
    trigger('toggleButton', [
      state('disabled', style({
        borderColor: 'grey',
        backgroundColor: 'grey',
        color: 'black',
        opacity: 0.2
      })),
      state('enabled', style({
        color: 'white',
        opacity: 1
      })),
      transition('disabled <=> enabled', [
        animate('0.2s')
      ])
    ]),
    trigger('switchViews', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('1000ms')
      ])
    ])
  ]
})
export class ForgotPasswordComponent implements OnInit, OnDestroy {
  showError: Boolean = false;
  errorMessage: String;
  showDone: Boolean = false;
  submitButton: String = 'disabled';

  emails: UntypedFormGroup;

  emailInUse = true;
  emailErrorMsg = '';
  private ngUnsubscribe = new Subject<void>();

  constructor(
    private authValidationService: AuthValidationService,
    private authService: AuthService
  ) {
    this.emails = new UntypedFormGroup({
      'email': this.authValidationService.getInputFormControl('email'),
      'confirmEmail': this.authValidationService.getInputFormControl('required')
    }, { validators: MatchValidator.mustMatch('email', 'confirmEmail') });
  }

  ngOnInit(): void {
    this.authValidationService.getErrorState().subscribe(err => this.showError = err);
  }

  /**
   * Disables and grays out the 'Request Password Reset' button if there are any input errors, enables them otherwise
   */
  toggleButton(): void {
    if (this.emails.controls.email.errors || this.emails.controls.confirmEmail.errors) {
      this.submitButton = 'disabled';
    } else {
      this.submitButton = 'enabled';
    }
  }

  /**
   * Sends an email to create new password to the specified email.
   * Displays an error banner if an error is thrown.
   */
  submit(): void {
    // Validate the email first
    this.validateEmail();

    // Check if the form is valid
    if (this.emails.valid) {
      this.authService.initiateResetPassword(this.emails.get('email').value).subscribe(
        val => {
          this.showDone = true;
        },
        error => {
          const parsedError = JSON.parse(error);
          this.errorMessage = parsedError.message;
          this.authValidationService.showError();
        }
      );
    } else {
      // Handle form invalid state
      this.toggleButton();
    }
  }

  private validateEmail(): void {
    const emails = this.emails.get('email');

    // Clear any previous errors
    emails.setErrors(null);

    this.authService.emailInUse(emails.value)
      .then((res: any) => {
        this.emailInUse = res.identifierInUse;
        if (this.emailInUse) {
          this.emailErrorMsg = 'This email is already registered!';
          emails.setErrors({ emailInUse: true });
        } else {
          this.emailErrorMsg = '';
        }
      })
      .catch((err) => {
        const parsedError = JSON.parse(err);
        this.errorMessage = parsedError.message;
        this.authValidationService.showError();
      });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
