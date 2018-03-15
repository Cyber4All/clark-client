import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/auth.service';
import { ActivatedRoute } from '@angular/router';
import { User } from '@cyber4all/clark-entity';

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

    if (!this.validate()) {
      return false;
    }

    if (this.regInfo.password !== this.passwordVerify) {
      this.error('Passwords do not match!');
      return;
    }

    let u = new User(
      this.regInfo.username,
      this.regInfo.firstname + ' ' + this.regInfo.lastname,
      this.regInfo.email,
      this.regInfo.organization,
      this.regInfo.password
    );

    this.auth.register(u).subscribe(val => {
      if (this.redirectRoute) {
        window.location.href = window.location.origin + this.redirectRoute;
      } else {
        window.location.href = this.redirectUrl;
      }
    }, error => {
      this.error(error.error.message);
    });
  }

  validate(): boolean {
    let m: boolean[] = Object.values(this.regInfo).map(function(l) { return (l && l !== '' && true) || false; });
    let email = this.regInfo.email.match(/(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/g) !== null;
    
    if (m.includes(false)) {
      this.error('Please fill in all fields!');
      return false;
    } else if (!email) {
      this.error('Please enter a valid email!');
      return false;
    }
    
    return true;
  }

  error(text: string = 'An error occured', duration: number = 4000) {
    this.registerFailure = text;

    this.registerFailureTimer = setTimeout(() => {
      this.registerFailure = undefined;
    }, duration);
  }

}
