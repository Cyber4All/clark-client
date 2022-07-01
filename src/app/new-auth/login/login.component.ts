import { animate, style, transition, trigger } from '@angular/animations';
import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '@env/environment';
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

  finalAttempt: number;
  errorMsg = '';
  bannerMsg = '';
  attempts = 0;
  loginFailure: Boolean = false;
  isNameLogin = false;
  
  authInfo: {
      username: string, 
      password: string
  };
  
  @ViewChild('username')
  username;
  @ViewChild('password')
  password;
  
  redirectUrl;
  gatewayUrl = environment.apiURL;
  constructor(
    private authValidation: AuthValidationService,
    private route: ActivatedRoute,
    private auth: AuthService,
    private router: Router
    ) {
      this.route.parent.data.subscribe(() => {
        if (route.snapshot.queryParams.redirectUrl) {
          this.redirectUrl = decodeURIComponent(route.snapshot.queryParams.redirectUrl);
        }
        if (route.snapshot.queryParams.err) {
          this.bannerMsg = decodeURIComponent(route.snapshot.queryParams.err);
          this.authValidation.showError();
        }
      });
     }

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
      this.bannerMsg = 'Please fill out all required fields';
      this.authValidation.showError();
    } else if (this.attempts < 5 || this.hourPassed(Date.parse(new Date().toDateString()))){
      this.attempts++;
      //if this is the fifth attempt mark it as the finalAttempt
      if(this.attempts === 5) {
        this.finalAttempt = Date.parse(new Date().toDateString());
      }

      this.auth
      .login(this.authInfo)
      .then(() => {
        if (this.redirectUrl) {
          window.location = this.redirectUrl;
        } else {
          this.router.navigate(['home']);
        }
      })
      .catch(error => {
        this.bannerMsg = error.message + this.attemptMsg();
        this.authValidation.showError();
      });
    } else {
      this.bannerMsg = 'Sorry' + this.attemptMsg();
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

  /**
   * returns true if an hour has passed since the last
   * attempt before timeout
   *
   * @param now the time when called
   * @returns true if an hour has passed
   */
  hourPassed(now: number): boolean {
    //(now - then) > 1hr
    if(now - this.finalAttempt > 3600000) {
      this.attempts = 0;
      return true;
    }
    return false;
  }
}
