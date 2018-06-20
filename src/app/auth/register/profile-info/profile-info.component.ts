import { Component, OnInit, Input, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { AuthService } from '../../../core/auth.service';
import { RegisterComponent } from '../../register/register.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'clark-profile-info',
  templateUrl: './profile-info.component.html',
  styleUrls: ['./profile-info.component.scss']
})
export class ProfileInfoComponent implements OnInit, OnDestroy {
  @Input() group: FormGroup;

  @ViewChild('usernameInput') usernameInput: ElementRef;
  @ViewChild('passwordInput') passwordInput: ElementRef;
  @ViewChild('passwordVerifyInput') passwordVerifyInput: ElementRef;

  result: boolean;

  // array of subscriptions to destroy on component destroy
  subs: Subscription[] = [];

  // flags
  querying = false;
  usernameError = false;
  passwordError = false;
  passwordVerifyError = false;


  constructor(private auth: AuthService, private register: RegisterComponent) {}

  ngOnInit() {
    // listen for input events on the income input and send text to suggestion component after 650 ms of debounce
    this.subs.push(
      Observable.fromEvent(this.usernameInput.nativeElement, 'input')
      .map(x => x['currentTarget'].value)
      .debounceTime(650)
      .subscribe(val => {
        this.querying = true;
        this.usernameError = false;
        this.auth.identifiersInUse(val).then((res: any) => {
          this.querying = false;
          this.result = res.inUse;
          if (!this.result) {
            this.register.setInUseUsername(this.result);
          } else {
            this.usernameError = true;
            this.register.error('This username is already taken');
            this.register.setInUseUsername(this.result);
          }
        });
      })
    );

    this.subs.push(
      Observable.fromEvent(this.passwordInput.nativeElement, 'input')
      .map(x => x['currentTarget'].value)
      .debounceTime(650)
      .subscribe(val => {
        this.passwordError = !this.checkPassword(val);
      })
    );

    this.subs.push(
      Observable.fromEvent(this.passwordVerifyInput.nativeElement, 'input')
      .map(x => x['currentTarget'].value)
      .debounceTime(650)
      .subscribe(val => {
        this.passwordVerifyError = !this.checkPasswordsIdentical(val);
      })
    );
  }

  /**
   * Takes a password string and makes sure it is of the correct structure (IE numbers, symbols, etc)
   * @param password
   */
  checkPassword(password: string) {
    // no need to pass through regex loop if length is bad
    if (password.length < 3) {
      return false;
    }

    // length is OK, let's check for proper structure
    const r: RegExp = /([0-9]{1})|([a-z]){1}|([A-Z]){1}|([!,@,#,$,%,^,&,*,\,,|,\],\[,\{,\},<,>,\.]{1})/g;
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

    // I guess the pizza wasn't aggressive.
    return true;
  }

  checkPasswordsIdentical(verifiedValue): boolean {
    console.log(verifiedValue === this.group.value.password);
    return verifiedValue === this.group.value.password;
  }

  ngOnDestroy() {
    // unsubscribe from all observables
    for (let i = 0, l = this.subs.length; i < l; i++) {
      this.subs[i].unsubscribe();
    }
  }
}
