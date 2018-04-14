import { Component, OnInit, Input, forwardRef } from '@angular/core';
import { NgControl, FormGroup, FormControl, Validators, ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import { animate, state, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'clark-profile-info',
  templateUrl: './profile-info.component.html',
  styleUrls: ['./profile-info.component.scss'], 
  animations: [
    trigger(
      'slideInRight',
      [
        transition(
          ':enter', [
            style({transform: 'translateX(100%)', opacity: 0}),
            animate('500ms', style({transform: 'translateX(0)', opacity: 1}))
          ]
        ),
        transition(
          ':leave', [
            style({transform: 'translateX(0)', 'opacity': 1}),
            animate('500ms', style({transform: 'translateX(-100%)', opacity: 0}))
          ]
        )
      ])
  ]
})
export class ProfileInfoComponent implements OnInit {
  @Input() group: FormGroup;
  slide: String = 'enter';
  
  /*loading: boolean = false;
  verified: boolean = true;

  profileInfo = {
    username: '',
    password: '',
  };

  carriedInfo = {
    firstname: '',
    lastname: '',
    email: '', 
    organization: ''
  }

  regForm = new FormGroup({
    username: new FormControl(null, Validators.required),
    password: new FormControl(null, Validators.required),
    verifypassword: new FormControl(null, Validators.required),
  });

  passwordVerify = '';
  registerFailure;
  registerFailureTimer;
  redirectRoute;
  redirectUrl;*/

  constructor() { 
    /*this.carriedInfo.firstname = this.firstname; 
    this.carriedInfo.lastname = this.lastname; 
    this.carriedInfo.email = this.email; 
    this.carriedInfo.organization= this.organization; */
  }

  ngOnInit() {}

  /*submit() {
    this.registerFailure = undefined;
    clearTimeout(this.registerFailureTimer);
    this.loading = false;

    if (!this.validate()) {
      return false;
    } else {
      return true; 
    }
  }

  validate(): boolean {
    let m: boolean[] = Object.values(this.profileInfo).map(function(l) {
      return (l && l !== '' && true) || false;
    });

    if (m.includes(false) && this.verified === true) {
      this.error('Please fill in all fields!');
      this.loading = false;
      return false;
    } else if (this.profileInfo.password !== this.passwordVerify) {
      this.error('Passwords do not match!');
      this.loading = false;
      return false;
    }

    return true;
  }

  error(text: string = 'An error occured', duration: number = 4000) {
    this.registerFailure = text;
    this.loading = false;
    this.registerFailureTimer = setTimeout(() => {
      this.registerFailure = undefined;
    }, duration);
  }

  captureResponse(event) {
    this.verified = event;
  }*/

}
