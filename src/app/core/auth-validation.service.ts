import { Injectable } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class AuthValidationService {

  email: FormControl = new FormControl('', [
    Validators.required,
    Validators.email
  ]);
  confirmEmail: FormControl = new FormControl('', [
    Validators.required,
    Validators.email,
    Validators.pattern(this.email.value)
  ]);
  text: FormControl = new FormControl('', [
    Validators.required
  ]);
  password: FormControl = new FormControl('', [
    Validators.minLength(8),
    Validators.required
  ]);
  constructor() { }

  getFormControl(type: String) {
    switch(type){
      case 'text':
        return this.text;
      case 'email':
        return this.email;
      case 'confirmEmail':
        return this.confirmEmail;
      case 'password':
        return this.password;
    }
  }

  getErrorMessage(control: FormControl) {
    if(control.hasError('required')) {
      return 'This field is required';
    } else if (control.hasError('email')) {
      return 'Invalid Email Address';
    } else if (control.hasError('minlength')) {
      return 'Minimum Length 8 characters';
    } else {
      return 'there is an error';
    }
  }
}
