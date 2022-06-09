import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';

import { AuthValidationService } from 'app/core/auth-validation.service';
import { doesNotMatchValidator } from 'app/core/doesNotMatchValidator';

@Component({
  selector: 'clark-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit {
  isError: Boolean = true;
  emailsMatch: Boolean = true;

  confirmEmailTemp: string = "";
  currentEmail = new FormControl('',[
    Validators.required,
    Validators.email,
    doesNotMatchValidator(this.confirmEmailTemp)
  ]);
  confirmEmail = new FormControl('', [
    doesNotMatchValidator(this.currentEmail.value)
  ]);

  constructor(private authValidationService: AuthValidationService) {
  }

  ngOnInit(): void {
    this.authValidationService.getErrorState().subscribe(err => this.isError = err);
  }

  showEmail(): void {
    console.log(this.currentEmail.value);
  }

  // matchEmails(): void {
  //   (this.authValidationService.getInputErrorMessage(this.currentEmail) !== "Invalid Email Address" &&
  //   this.currentEmail.value === this.confirmEmail.value) ? this.emailsMatch = true : this.emailsMatch = false;
  // }

  displayError(control: FormControl): string {
    if(this.authValidationService.getInputErrorMessage(control))
      return this.authValidationService.getInputErrorMessage(control);
    else if(this.confirmEmail.errors?.doesNotMatch)
      return "Emails do not match!";
  }

}
