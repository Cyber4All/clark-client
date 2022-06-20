import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { RegisteredEmailValidator } from 'app/shared/validators/RegisteredEmailValidator';
import { MatchValidator } from 'app/shared/validators/MatchValidator';
import { AuthValidationService } from 'app/core/auth-validation.service';

@Component({
  selector: 'clark-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit, AfterViewInit {

  @ViewChild('email') emailInput;
  @ViewChild('confirmEmail') confirmEmailInput;

  showError: Boolean = false;

  constructor(private registeredEmailValidator: RegisteredEmailValidator, private authValidationService: AuthValidationService) { }

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
    const emails = new FormGroup({
      'email': emailInputControl,
      'confirmEmail': confirmEmailInputControl
    }, { validators: MatchValidator.mustMatch('email', 'confirmEmail') });
  }

}
