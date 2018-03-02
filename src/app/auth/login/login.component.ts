import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { User } from '@cyber4all/clark-entity';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  authInfo: {username: string, password: string} = {username: '', password: ''};
  loginFailure: string;
  loginFailureTimer;
  redirectRoute;
  redirectUrl;

  constructor(private auth: AuthService, private router: Router, private route: ActivatedRoute) {
    this.route.parent.data
    .subscribe((data) => {
      if (route.snapshot.queryParams.returnUrl) {
        this.redirectUrl = this.auth.makeRedirectURL(route.snapshot.queryParams.returnUrl);
      } else {
        if (route.snapshot.queryParams.redirectRoute) {
          this.redirectRoute = route.snapshot.queryParams.redirectRoute;
        } else {
          this.redirectRoute = data.redirect;
        }
      }
    });
  }

  ngOnInit() {
  }

  submit() {
    this.loginFailure = undefined;
    clearTimeout(this.loginFailureTimer);

    this.auth.login(this.authInfo).then(val => {
      if (this.redirectRoute) {
        window.location.href = window.location.origin + this.redirectRoute;
        // this.router.navigate([this.redirectRoute]);
      } else {
        window.location.href = this.redirectUrl;
      }
    }).catch(error => {
      console.log(error);
      this.error(error.error.message);
    });
  }

  error(text: string = 'An error occured', duration: number = 4000) {
    this.loginFailure = text;

    this.loginFailureTimer = setTimeout(() => {
      this.loginFailure = undefined;
    }, duration);
  }

}
