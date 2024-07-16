import { Injectable } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { BehaviorSubject, Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthValidationService {
  private minLengthValidator = Validators.minLength(8);
  public isError = new BehaviorSubject<boolean>(false);

  constructor() { }

  /**
   * returns a form control object for a specific type
   * of input field
   *
   * @param type the type of form control required i.e.
   * userName, password, email, or text (defualt no validation)
   * @returns Form control object for specific type of input field
   */
  public getInputFormControl(type: 'email' | 'username' | 'password' | 'required' | 'text'): FormControl {
    switch(type){
      case 'username':
        return new FormControl('', [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(30)
        ]);
      case 'email':
        return new FormControl('', [
          Validators.required,
          Validators.email
        ]);
      case 'password':
        return new FormControl('', [
          this.minLengthValidator,
          //one number, one lower, one upper, one special, no spaces
          Validators.pattern('^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&()+=])(?=\\S+$).*$'),
          Validators.required
        ]);
      case 'required':
        return new FormControl('', Validators.required);
      case 'text':
        return new FormControl('');
    }
  }
  /**
   * takes a form control object, and returns an error message for
   * the specific error that has occured
   *
   * @param control Form control from this specific input field
   * @param match String that specifies what field is being matched
   * @returns error message
   */
  public getInputErrorMessage(control: FormControl, match?: string): string {
    if(control.hasError('required')) {//field not filled out
      return('This field is required');
    } else if (control.hasError('email')) {//email error
      return('Invalid Email Address');
    } else if (control.hasError('minlength')) {//minimum length error
      if(control.hasValidator(this.minLengthValidator)){
        return('Minimum Length 8 characters');//min length for password
      }
      return('Minimum Length 2 characters');//min length for username
    } else if(control.hasError('maxLength')) {//max length for username
      return('Maximum Length 30 characters');
    } else if(control.hasError('pattern')) {//pattern error for password
      return(this.getPwordRegexErrMsg(control.value));
    } else if(control.hasError('mustMatch')) {
      return !match ? 'Fields do not match' : `${match}s do not match`;
    }
  }

  /**
   * takes a string of the password value and returns
   * an error message related to the specific character
   * that is missing from the password
   *
   * @param value value of the password input field
   * @returns error message for type of character missing from
   * the password
   */
  private getPwordRegexErrMsg(value: string): string{
    if (value.includes(' ')){
      return 'Password cannot contain spaces';
    }
    if (!(value.match('^(?=.*[0-9]).*$'))) {
      return 'Number required';
    }
    if (!(value.match('^(?=.*[a-z]).*$'))) {
      return 'Lowercase letter required';
    }
    if (!(value.match('^(?=.*[A-Z]).*$'))) {
      return 'Uppercase letter required';
    }
    if (!(value.match('^(?=.*[!@#$%^&()+=]).*$'))) {
      return 'Special character required';
    }
  }

  /**
   * toggles the error banner
   *
   * @param duration length of time to show the banner
   *
   */
   public showError(duration: number = 4000): void {
    this.isError.next(true);
    setTimeout(() => {
      this.isError.next(false);
    }, duration);
  }

  /**
   * subscribe to this function to get the error banner state
   *
   * @returns error state
   */
  public getErrorState(): Observable<Boolean> {
    return this.isError;
  }
}
