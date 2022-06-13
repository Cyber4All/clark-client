import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';

import { AuthValidationService } from 'app/core/auth-validation.service';
import { AuthService } from 'app/core/auth.service';
import { doesNotMatchValidator } from 'app/core/doesNotMatchValidator';

@Component({
  selector: 'clark-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit {
  isError: Boolean = true;
  done = false;

  currentEmail = new FormControl('',[
    Validators.required,
    Validators.email
  ]);
  confirmEmail = new FormControl('', [
    doesNotMatchValidator(this.currentEmail.value)
  ]);

  constructor(private authValidationService: AuthValidationService,
              private authService: AuthService) {
  }

  ngOnInit(): void {
    this.authValidationService.getErrorState().subscribe(err => this.isError = err);
  }

  submit(): void {
    this.authService.initiateResetPassword(this.currentEmail.value)
    .subscribe(val => {
      this.done = true;
    }, error => {});
  }

  setDone(): void {
    this.done = true;
  }

  emailsMatch(): void {
    this.confirmEmail = new FormControl(this.confirmEmail.value, [
      doesNotMatchValidator(this.currentEmail.value)
    ]);
  }

  displayError(control: FormControl): string {
    if(this.authValidationService.getInputErrorMessage(control)){
      return this.authValidationService.getInputErrorMessage(control);
    } else if(this.confirmEmail.errors?.doesNotMatch) {
      return 'Emails do not match!';
    }
  }

}
