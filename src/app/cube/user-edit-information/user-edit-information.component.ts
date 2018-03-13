import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { UserService } from '../../core/user.services';
import { AuthService } from '../../core/auth.service';
import { OnChanges } from '@angular/core';

@Component({
  selector: 'app-user-edit-information',
  templateUrl: './user-edit-information.component.html',
  styleUrls: ['./user-edit-information.component.scss']
})
export class UserEditInformationComponent implements OnInit, OnChanges {

  @Input('user') user;
  
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

  constructor(private userService: UserService) {}

  ngOnInit() {
    
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.user) {
      this.editInfo = {
        firstname: this.user.name ? this.user.name.split(' ')[0] : '',
        lastname: this.user.name ? this.user.name.split(' ')[1] : '',
        email: this.user.email || '',
        organization: this.user.organization || '',
      };
    }
  }

  submit() {
    this.registerFailure = undefined;
    clearTimeout(this.registerFailureTimer);
    
    let concatInfo = { 
      name: this.editInfo.firstname +  " " + this.editInfo.lastname,
      email: this.editInfo.email, 
      organization: this.editInfo.organization
    }

    this.userService.editUserInfo(concatInfo).then(val => {
      if (this.redirectRoute) {
        window.location.href = window.location.origin + this.redirectRoute;
        // this.router.navigate([this.redirectRoute]);
      } else {
        window.location.href = this.redirectUrl;
      }
    }, error => {
      console.log(error);
    });
  }

  error(text: string = 'An error occured', duration: number = 4000) {
    this.registerFailure = text;

    this.registerFailureTimer = setTimeout(() => {
      this.registerFailure = undefined;
    }, duration);

  }

}
