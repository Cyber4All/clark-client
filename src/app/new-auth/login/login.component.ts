import { animate, style, transition, trigger } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
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
      'inAnimation',
      [
        transition(
          ':enter',
          [
            style({ height: 0, opacity: 0 }),
            animate('.5s ease-out',
                    style({ height: 85, opacity: 1 }))
          ]
        )
      ]
    ),
        trigger(
          'outAnimation',
          [
            transition(
              ':leave',
              [
                style({ height: 50, opacity: 1 }),
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
  authInfo: {username: string, password: string} = {username:'', password:''};
  errorMsg: String = 'There was an error';
  loading = false;

  constructor(
    private authValidation: AuthValidationService,
    private auth: AuthService,
    private router: Router
    ) { }

  ngOnInit(): void {
    this.authValidation.getErrorState().subscribe(err => this.loginFailure = err);
  }

/**
 * TO-DO: implement this method
 *
 * @param form data from NgForm
 */
  public async submit(form: NgForm): Promise<void> {
    this.authInfo = form.value;
    if(!this.isPopulated()) {
      this.authValidation.showError();
    }

    this.auth
      .login(this.authInfo)
      .then(() => {
          this.router.navigate(['home']);
      })
      .catch(error => {
        this.loading = false;
        this.errorMsg = error;
        this.authValidation.showError();
      });
  }

/**
 * ensures all fields are populated when form is submitted
 *
 * @returns true if all fields are populated
 */
  isPopulated(): boolean {
    if(this.authInfo.username && this.authInfo.password && true){
      return true;
    }
    this.errorMsg = 'please fill out all fields';
    return false;
  }

  showPass(){
    this.isNameLogin = true;
  }
}
