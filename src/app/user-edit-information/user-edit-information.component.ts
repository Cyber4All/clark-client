import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/services/auth.service';

@Component({
  selector: 'app-user-edit-information',
  templateUrl: './user-edit-information.component.html',
  styleUrls: ['./user-edit-information.component.css']
})
export class UserEditInformationComponent implements OnInit {
  
  editInfo = {
    firstname: '',
    lastname: '',
    email: '',
    organization: '',
  };

  passwordVerify = '';
  registerFailure;
  registerFailureTimer;
  redirectRoute;
  redirectUrl;

  constructor(private auth: AuthService) {}

  ngOnInit() {
    
  }

  submit() {
    this.registerFailure = undefined;
    clearTimeout(this.registerFailureTimer);

    this.auth.updateInfo(this.editInfo).subscribe(val => {
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
