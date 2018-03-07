import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/auth.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'clark-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

  regInfo = {
    firstname: '',
    lastname: '',
    username: '',
    email: '',
    organization: '',
    password: ''
  };

  passwordVerify = '';
  registerFailure;
  registerFailureTimer;
  redirectRoute;
  redirectUrl;

  constructor(private auth: AuthService, private route: ActivatedRoute) {
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
    this.registerFailure = undefined;
    clearTimeout(this.registerFailureTimer);

    if (this.regInfo.password !== this.passwordVerify) {
      this.error('Passwords do not match!');
      return;
    }

    this.auth.register(this.regInfo).subscribe(val => {
      if (this.redirectRoute) {
        window.location.href = window.location.origin + this.redirectRoute;
        // this.router.navigate([this.redirectRoute]);
      } else {
        window.location.href = this.redirectUrl;
      }
    }, error => {
      this.error(error.error.message);
    });
  }

  error(text: string = 'An error occured', duration: number = 4000) {
    this.registerFailure = text;

    this.registerFailureTimer = setTimeout(() => {
      this.registerFailure = undefined;
    }, duration);
  }

}
