import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatchValidator } from 'app/shared/validators/MatchValidator';
import { AuthValidationService } from 'app/core/auth-validation.service';
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
export class ForgotPasswordComponent implements OnInit, OnDestroy{
  showError: Boolean = false;
  errorMessage: String;
  showDone: Boolean = false;
  submitButton: String = 'disabled';

  emails: FormGroup = new FormGroup({
    'email': this.authValidationService.getInputFormControl('email'),
    'confirmEmail': this.authValidationService.getInputFormControl('required')
  }, { validators: MatchValidator.mustMatch('email', 'confirmEmail') });;

  emailInUse = true;
  emailErrorMsg = '';
  private ngUnsubscribe = new Subject<void>();

  constructor(
    private authValidationService: AuthValidationService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.authValidationService.getErrorState().subscribe(err => this.showError = err);
    this.validateEmail();
  }

  /**
   * Disables and grays out the 'Request Password Reset' button if there are any input errors, enables them otherwise
   */
  toggleButton(): void {
    if(this.emails.controls.email.errors || this.emails.controls.confirmEmail.errors) {
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
    if(this.submitButton === 'enabled') {
      this.authService.initiateResetPassword(this.emails.get('email').value).subscribe(val => {
        this.showDone = true;
      }, error => {
        this.errorMessage = 'Something went wrong! We\'re looking into the issue. Please check back later.';
        this.authValidationService.showError();
      });
    }
  }

  /**
   * Validates the email by ensuring that it exists in the database
   * Displays an error message beneath the input if the email does not exist
   */
  private validateEmail() {
      this.emails.get('email').valueChanges.pipe(
        debounce(() => {
          return interval(600);
        }),
        takeUntil(this.ngUnsubscribe)).subscribe(
          async (value) => {
            await this.authService.emailInUse(value)
            .then((res: any) => {
              this.emailInUse = res.identifierInUse;
              if(!this.emailInUse) {
                this.emailErrorMsg = 'This email is not registered!';
                this.emails.get('email').setErrors({ emailInUse: false });
              }
            })
            .catch((err) => {
              this.errorMessage = 'Something went wrong! We\'re looking into the issue. Please check back later.';
              this.authValidationService.showError();
            });
      });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
