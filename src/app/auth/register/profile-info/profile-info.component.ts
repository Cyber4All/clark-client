import { Component, OnInit, Input, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { AuthService } from '../../../core/auth.service';
import { RegisterComponent } from '../register.component';
import { fromEvent, Subject } from 'rxjs';

import { takeUntil, debounceTime, map } from 'rxjs/operators';

@Component({
  selector: 'clark-profile-info',
  templateUrl: './profile-info.component.html',
  styleUrls: ['./profile-info.component.scss']
})
export class ProfileInfoComponent implements OnInit, OnDestroy {
  @Input() group: FormGroup;

  @ViewChild('usernameInput', {static: true}) usernameInput: ElementRef;
  @ViewChild('passwordInput', {static: true}) passwordInput: ElementRef;
  @ViewChild('passwordVerifyInput', {static: true}) passwordVerifyInput: ElementRef;

  result: boolean;

  // flags
  querying = false;
  usernameError: string = undefined;
  passwordError = false;
  passwordVerifyError = false;

  destroyed$ = new Subject<void>();


  constructor(private auth: AuthService, private register: RegisterComponent) {}

  ngOnInit() {
    // listen for input events on the income input and send text to suggestion component after 650 ms of debounce
    fromEvent(this.usernameInput.nativeElement, 'input').pipe(
      map(x => x['currentTarget'].value),
      debounceTime(650),
      takeUntil(this.destroyed$)
    ).subscribe(val => {
      if (val.length < 3 || val.length > 20) {
        this.usernameError = 'Usernames must be at least 3 characters long and no longer than 20 characters.';
        this.register.error(this.usernameError);
        this.register.setInUseUsername(this.result);
        return;
      }
      this.querying = true;
      this.usernameError = undefined;
      this.auth.usernameInUse(val).then((res: any) => {
        this.querying = false;
        this.result = res.inUse;
        if (!this.result) {
          this.register.setInUseUsername(this.result);
        } else {
          this.usernameError = 'This username already exists in our system. Please pick another username.';
          this.register.error(this.usernameError);
          this.register.setInUseUsername(this.result);
        }
      });
    });

    fromEvent(this.passwordInput.nativeElement, 'input').pipe(
      map(x => x['currentTarget'].value),
      debounceTime(650),
      takeUntil(this.destroyed$)
    ).subscribe(val => {
        this.passwordError = !this.checkPassword(val);
      });

    fromEvent(this.passwordVerifyInput.nativeElement, 'input').pipe(
      map(x => x['currentTarget'].value),
      debounceTime(650),
      takeUntil(this.destroyed$)
    ).subscribe(val => {
        this.passwordVerifyError = !this.checkPasswordsIdentical(val);
      });
  }

  /**
   * Takes a password string and makes sure it is of the correct structure (IE numbers, symbols, etc)
   * @param password
   */
  checkPassword(password: string) {
    // no need to pass through regex loop if length is bad
    if (password.length < 8) {
      return false;
    }

    // length is OK, let's check for proper structure
    const r: RegExp = /([0-9]{1})|([a-z]){1}|([A-Z]){1}|([!,@#$%^*&|~`\]\[\{\}<>.\\_\-+=\(\)/?]{1})/g;
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

  checkPasswordsIdentical(verifiedValue): boolean {
    return verifiedValue === this.group.value.password;
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.unsubscribe();
  }
}
