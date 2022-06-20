import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { RegisteredEmailValidator } from 'app/shared/validators/RegisteredEmailValidator';
import { MatchValidator } from 'app/shared/validators/MatchValidator';
import { AuthValidationService } from 'app/core/auth-validation.service';
import { AuthService } from 'app/core/auth.service';

@Component({
  selector: 'clark-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit, AfterViewInit {

  @ViewChild('email') emailInput;
  @ViewChild('confirmEmail') confirmEmailInput;

  showError: Boolean = false;
  errorMessage: String;
  showDone: Boolean = false;
  submitButton: String = 'disabled';
  emails: FormGroup;

  constructor(
    private registeredEmailValidator: RegisteredEmailValidator,
    private authValidationService: AuthValidationService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.authValidationService.getErrorState().subscribe(err => this.showError = err);
  }

  ngAfterViewInit(): void {
    const emailInputControl = this.emailInput.valueAccessor.control; // The FormControl of the email input
    const confirmEmailInputControl = this.confirmEmailInput.valueAccessor.control; // The FormControl of the confirm email input

    // Checks if emailInput is a registered email
    emailInputControl.addAsyncValidators(this.registeredEmailValidator.validate.bind(this.registeredEmailValidator));
    emailInputControl.updateValueAndValidity();

    // Combines inputs into a FormGroup to check if inputs match using MatchValidator
    this.emails = new FormGroup({
      'email': emailInputControl,
      'confirmEmail': confirmEmailInputControl
    }, { validators: MatchValidator.mustMatch('email', 'confirmEmail') });
  }

  // Disables button if there are any input errors, enables them otherwise
  toggleButton(): void {
    if(this.emails.controls.email.errors || this.emails.controls.confirmEmail.errors) {
      this.submitButton = 'disabled';
    } else {
      this.submitButton = 'enabled';
    }
  }

  submit(): void {
    if(this.submitButton === 'enabled') {
      this.authService.initiateResetPassword(this.emailInput.valueAccessor.control.value).subscribe(val => {
        this.showDone = true;
      }, error => {
        this.errorMessage = error.message;
        this.authValidationService.showError();
      });
    }
  }

  switch(): void {
    this.showDone = !this.showDone;
  }
}
