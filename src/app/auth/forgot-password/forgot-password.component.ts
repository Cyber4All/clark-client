import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {

  email = '';
  failure: string;
  failureTimer;
  done = false;

  constructor(private auth: AuthService) { }

  ngOnInit() {
  }

submit() {
  this.failure = undefined;
    clearTimeout(this.failureTimer);

    this.auth.initiateResetPassword(this.email).subscribe(val => {
      this.done = true;
    }, error => {
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
