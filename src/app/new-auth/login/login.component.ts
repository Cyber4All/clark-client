import { animate, style, transition, trigger } from '@angular/animations';
import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthValidationService } from 'app/core/auth-validation.service';
import { AuthService } from 'app/core/auth.service';

@Component({
  selector: 'clark-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  animations: [
    trigger(
      'inOutAnimation',
      [
        transition(
          ':enter',
          [
            style({ height: 0, opacity: 0 }),
            animate('.5s ease-out',
                    style({ height: 85, opacity: 1 }))
          ]
        ),
        transition(
              ':leave',
              [
                style({ height: 85, opacity: 1 }),
                animate('.5s ease-in',
                        style({ height: 0, opacity: 0 }))
              ]
            )
          ]
        )
      ]
})
export class LoginComponent implements OnInit{

  loginFailure: Boolean = false;
  isNameLogin = false;
  authInfo: {username: string, password: string};
  errorMsg: String = 'There was an error';
  attempts = 0;
  @ViewChild('username')
  username;
  @ViewChild('password')
  password;
  constructor(
    private authValidation: AuthValidationService,
    private auth: AuthService,
    private router: Router
    ) { }

  ngOnInit(): void {
    this.authValidation.getErrorState().subscribe(err => this.loginFailure = err);
  }

/**
 * checks for 'required' field errors
 * then logs the user in
 *
 * @param form data from NgForm
 */
  public submit(form: NgForm) {
    this.authInfo = form.value;
    //get form control for all fields
    const pwordFormCtl = this.password.valueAccessor.control;
    const usernameFormCtl = this.username.valueAccessor.control;

    if(usernameFormCtl.hasError('required') || pwordFormCtl.hasError('required')) {
      this.errorMsg = 'Please fill out all required fields';
      this.authValidation.showError();
    } else if (this.attempts < 5){
      this.attempts++;
      this.auth
      .login(this.authInfo)
      .then(() => {
          this.router.navigate(['home']);
      })
      .catch(error => {
        this.errorMsg = error.message + this.attemptMsg();
        this.authValidation.showError();
      });
    } else {
      this.errorMsg = 'Sorry' + this.attemptMsg();
      this.authValidation.showError();
    }
  }

  /**
   * gets login attempt message based on number
   * of attempts
   *
   * @returns a login attempt message
   */
  attemptMsg(): string {
    if(this.attempts >= 5){
      return ', you have exceeded your login attempts. Please try again in an hour.';
    }
    return `, you have ${5 - this.attempts} login attempts left this hour`;
  }

  /**
   * transitions when next or back is clicked
   */
  showPassField(){
    this.isNameLogin = !this.isNameLogin;
  }
}
