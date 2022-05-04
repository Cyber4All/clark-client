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
    //validator for pattern matching the email field.
  ]);
  userName: FormControl = new FormControl('', [
    Validators.required,
    Validators.minLength(2),
    Validators.maxLength(30)
  ]);
  password: FormControl = new FormControl('', [
    Validators.minLength(8),
    //one number, one lower, one upper, one special, no spaces
    Validators.pattern('^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&()+=])(?=\\S+$).*$'),
    Validators.required
  ]);
  text: FormControl = new FormControl('', [
  ]);
  constructor() { }

  getFormControl(type: String) {
    switch(type){
      case 'userName':
        return this.userName;
      case 'email':
        return this.email;
      case 'confirmEmail':
        return this.confirmEmail;
      case 'password':
        return this.password;
      case 'text':
        return this.text;
    }
  }

  getErrorMessage(control: FormControl) {
    if(control.hasError('required')) {//field not filled out
      return 'This field is required';
    } else if (control.hasError('email')) {//email error
      return 'Invalid Email Address';
    } else if (control.hasError('minlength')) {//minimum length error
      if(control === this.password){
        return 'Minimum Length 8 characters';//min length for password
      }
      return 'Minimum Length 2 characters';//min length for username
    } else if(control.hasError('maxLength')) {//max length for username
      return 'Maximum Length 30 characters';
    } else if(control.hasError('pattern')) {//pattern error for password
      return this.getPwordRegexErrMsg(String(control.value));
    }
  }

  private getPwordRegexErrMsg(value: string){
    if (value.includes(' ')){
      return 'Password cannot contain spaces';
    } else if (!(value.match('^(?=.*[0-9]).*$'))) {
      return 'Password requires a number';
    } else if (!(value.match('^(?=.*[a-z]).*$'))) {
      return 'Password requires a lowercase letter';
    } else if (!(value.match('^(?=.*[A-Z]).*$'))) {
      return 'Uppercase letter required';
    } else if (!(value.match('^(?=.*[!@#$%^&()+=]).*$'))) {
      return 'Password requires a special character';
    }
  }
}
