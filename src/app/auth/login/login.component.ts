import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { NavbarService } from '../../core/navbar.service';
import { CookieAgreementService } from '../../core/cookie-agreement.service';

@Component({
  selector: 'clark-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  authInfo: { username: string; password: string } = {
    username: '',
    password: ''
  };
  loginFailure: string;
  loginFailureTimer;
  redirectUrl;
  loading = false;
  element: any;

  constructor(
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private cookieAgreement: CookieAgreementService
  ) {
    this.route.parent.data.subscribe(() => {
      if (route.snapshot.queryParams.redirectUrl) {
        this.redirectUrl = decodeURIComponent(route.snapshot.queryParams.redirectUrl);
      }
    });
  }

  ngOnInit() {
    // Get an element that is outside of the form so that on mobile the submit button is not automatically given focus when
    // an incorrect username or password is entered
    this.element = document.getElementById('focus');
  }

  submit() {
    this.loginFailure = undefined;
    clearTimeout(this.loginFailureTimer);
    this.loading = true;

    if (!this.validate()) {
      this.loading = false;
      this.error('Please fill in all fields!');
      return false;
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
        this.loading = false;
        this.error(error.error || error.message || error);
        // Focus the focus element so that the form is not automatically submitted
        this.element.focus();
      });
  }

  validate(): boolean {
    return this.authInfo.username && this.authInfo.password && true;
  }

  error(text: string = 'An error occured', duration: number = 4000) {
    this.loginFailure = text;

    this.loginFailureTimer = setTimeout(() => {
      this.loginFailure = undefined;
    }, duration);
  }

  checkCookieAgreement() {
    return this.cookieAgreement.getCookieAgreementVal();
  }

}
