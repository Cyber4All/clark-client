import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { User } from '@cyber4all/clark-entity';

@Component({
    selector: 'clark-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {

  authInfo: {username: string, password: string} = {username: '', password: ''};
  loginFailure: string;
  loginFailureTimer;
  redirectRoute;
  redirectUrl;
  loading: boolean =  false;
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
    this.loading=true;

    if (!this.validate()) {
      this.loading=false;
      this.error('Please fill in all fields!');
      return false;
    }

    this.auth.login(this.authInfo).then(val => {
      if (this.redirectRoute) {
        window.location.href = window.location.origin + this.redirectRoute;
        // this.router.navigate([this.redirectRoute]);
      } else {
        window.location.href = this.redirectUrl;
      }

    }).catch(error => {
      console.log(error);
      this.loading = false;
      this.error(error.error);
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

}
