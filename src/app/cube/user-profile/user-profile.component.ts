import { Component, OnInit } from '@angular/core';
import { LearningObjectService } from '../learning-object.service';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'clark-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {

  name;
  employer = 'Towson University';
  contributor = false;
  modulesCreated: 20;
  title = 'Educator';
  email;

  // FIXME: Change to correct Type
  showContent: any;

  constructor(private service: LearningObjectService, private auth: AuthService) {
  }

  changeName() {    this.name = 'Houssein';  }
  ngOnInit() {
    const user = this.auth.user;
    this.email = user['email'];
    this.name = user['name'];
  }

}
