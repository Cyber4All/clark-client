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
export class ForgotPasswordComponent implements OnInit{


  showError: Boolean = false;
  errorMessage: String;
  showDone: Boolean = false;
  submitButton: String = 'disabled';
  emails: FormGroup = new FormGroup({
    'email': this.authValidationService.getInputFormControl('email'),
    'confirmEmail': this.authValidationService.getInputFormControl('email')
  }, { validators: MatchValidator.mustMatch('email', 'confirmEmail') });;


  constructor(
    private authValidationService: AuthValidationService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.authValidationService.getErrorState().subscribe(err => this.showError = err);
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
      this.authService.initiateResetPassword(this.emails.get('email').value).subscribe(val => {
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
