import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { NavbarService } from '../../core/navbar.service';

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

  constructor(
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    public nav: NavbarService
  ) {
    this.route.parent.data.subscribe(() => {
      if (route.snapshot.queryParams.redirectUrl) {
        this.redirectUrl = decodeURIComponent(route.snapshot.queryParams.redirectUrl);
      }
    });
  }

  ngOnInit() {
    this.nav.hide(); // hides navbar
    console.log('Login navbar visible ' + this.nav.visible);
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
          this.router.navigate([this.redirectUrl]);
        } else {
          this.router.navigate(['home']);
        }
      })
      .catch(error => {
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
