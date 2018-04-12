import { NgControl, FormGroup, FormControl, Validators } from '@angular/forms';
import { Component, OnInit, Input } from '@angular/core';
import { AuthService } from '../../../core/auth.service';
import { ActivatedRoute } from '@angular/router';
import { User } from '@cyber4all/clark-entity';
import * as md5 from 'md5';

@Component({
  selector: 'clark-gravatar-info',
  templateUrl: './gravatar-info.component.html',
  styleUrls: ['./gravatar-info.component.scss']
})
export class GravatarInfoComponent implements OnInit {
  @Input() gravatarInfo: FormGroup;

  /*loading: boolean = false;
  verified: boolean = false;

  @Input() firstname: string;
  @Input() lastname: string;
  @Input() email: string;
  @Input() organization: string;
  @Input() username: string;
  @Input() password: string;
  */

  regInfo = {
    email: '',
  };

  /*regForm = new FormGroup({
    email: new FormControl(null, Validators.required),
    captcha: new FormControl()
  });
  
  */
  siteKey = '6LfS5kwUAAAAAIN69dqY5eHzFlWsK40jiTV4ULCV';/*

  passwordVerify = '';
  registerFailure;
  registerFailureTimer;
  redirectRoute;
  redirectUrl;*/
  size: number = 200; 
  default: string; /* */ 

  constructor(private auth: AuthService, private route: ActivatedRoute) { 
    /*this.regInfo.firstname = this.firstname; 
    this.regInfo.lastname = this.lastname; 
    this.regInfo.username = this.username; 
    this.regInfo.organization = this.organization; 
    this.regInfo.password = this.password; */ 
    this.default = 'identicon';/*
    this.route.parent.data.subscribe(data => {
      if (route.snapshot.queryParams.returnUrl) {
        this.redirectUrl = this.auth.makeRedirectURL(
          route.snapshot.queryParams.returnUrl
        );
      } else {
        if (route.snapshot.queryParams.redirectRoute) {
          this.redirectRoute = route.snapshot.queryParams.redirectRoute;
        } else {
          this.redirectRoute = data.redirect;
        }
      }
    });*/
  }

  ngOnInit() {}

  /*submit() {
    this.registerFailure = undefined;
    clearTimeout(this.registerFailureTimer);
    this.loading = true;

    if (!this.validate()) {
      return false;
    }

    let u = new User(
      this.regInfo.username,
      `${this.regInfo.firstname.trim()} ${this.regInfo.lastname.trim()}`,
      this.regInfo.email.trim(),
      this.regInfo.organization.trim(),
      this.regInfo.password
    );

    this.auth.register(u).subscribe(
      val => {
        if (this.redirectRoute) {
          window.location.href = window.location.origin + this.redirectRoute;
        } else {
          window.location.href = this.redirectUrl;
        }
      },
      error => {
        this.error(error.error.message);
      }
    );
  }

  validate(): boolean {
    let m: boolean[] = Object.values(this.regInfo).map(function(l) {
      return (l && l !== '' && true) || false;
    });
    let email =
      this.regInfo.email.match(
        /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/g
      ) !== null;

    if (m.includes(false) && this.verified === true) {
      this.error('Please fill in all fields!');
      this.loading = false;
      return false;
    } else if (this.verified === false) {
      this.error('Please complete captcha!');
      this.loading = false;
      return false;
    } else if (!email) {
      this.error('Please enter a valid email!');
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

  getGravatarImage():string {
    // r=pg checks the rating of the Gravatar image 
    return 'http://www.gravatar.com/avatar/' + md5(this.regInfo.email) + '?s=' + this.size + 
      '?r=pg&d=' + this.default;
  }

}
