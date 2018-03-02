import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {

  failure: string = undefined;
  failureTimer = undefined;
  password = '';
  password_conf = '';
  otaCode: string;
  done = false;

  constructor(private auth: AuthService, private router: Router, private route: ActivatedRoute) { }

  ngOnInit() {
    this.otaCode = this.route.queryParams['_value']['otaCode'];
  }

  submit() {
    this.failure = undefined;
    clearTimeout(this.failureTimer);

    if (this.password !== this.password_conf) {
      this.error('Passwords do not match!');
      return;
    }

    this.auth.resetPassword(this.password, this.otaCode).subscribe(val => {
      this.done = true;
    }, error => {
      console.log(error);
      this.error(error.error.message);
    });
  }

  error(text: string = 'An error occured', duration: number = 4000) {
    this.failure = text;

    this.failureTimer = setTimeout(() => {
      this.failure = undefined;
    }, duration);
  }

}
