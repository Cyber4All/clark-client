import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/auth.service';
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

    const goodPassword = this.checkPassword(this.password);

    if (!goodPassword) {
      this.error('Password is not strong enough. Must contain 1 lowercase, 1 uppercase, 1 number, and 1 symbol');
    }

    this.auth.resetPassword(this.password, this.otaCode).subscribe(val => {
      this.done = true;
    }, error => {
      this.error(error.message);
    });
  }

  error(text: string = 'An error occured', duration: number = 4000) {
    this.failure = text;

    this.failureTimer = setTimeout(() => {
      this.failure = undefined;
    }, duration);
  }

  checkPassword(password: string) {
    // no need to pass through regex loop if length is bad
    if (password.length < 3) {
      return false;
    }

    // length is OK, let's check for proper structure
    const r: RegExp = /([0-9]{1})|([a-z]){1}|([A-Z]){1}|([!,@#$%^&|~`\]\[\{\}<>.\\_\-+=\(\)/?]{1})/g;
    let match = r.exec(password);

    /**
     * [0] = numbers (we'd like >= 1 here)
     * [1] = lower case letters (we'd like >= 2 here)
     * [2] = upper case letters (we'd like >= 1 here)
     * [3] = symbols (we'd like >= 1 here)
     */
    const CAPTURE_GROUPS = 4; // number of capture groups in regex
    const gate = [1, 2, 1, 1]; // this is an array of required minimum counts for each of the possible capture groups
    const matches = Array(4).fill(0); // this is where we'll store the counts for each group

     // using the exec function, gather all matches and store the total number of matches for each group in matches array
    while (match != null) {
      const groups = match.slice(1, 5); // slice the group indexes out of the returned array (the rest are irrelevent here)

      for (let i = 0; i < CAPTURE_GROUPS; i++) {
        if (typeof groups[i] !== 'undefined') {
          // we've located the group this is matched with, increment the number at the corresponding index in the matches array
          matches[i]++;
          break;
        }
      }

      // continue to next match
      match = r.exec(password);
    }

    // we should now have an Array(4) with each index containing the number of matches from each of the 4 possible groups
    // we'll iterate the gate array, and make sure that for each value, the corresponding value in the matches array is >=
    for (let i = 0; i < CAPTURE_GROUPS; i++) {
      if (gate[i] > matches[i]) {
        return false; // bad password
      }
    }

    return true;
  }
}
