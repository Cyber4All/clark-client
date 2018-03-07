import { USER_ROUTES } from '../../environments/route';
import { Component, OnInit } from '@angular/core';
import { LearningObjectService } from '../learning-object.service';
import { AuthService } from '../auth/services/auth.service';
import { LearningObject } from '@cyber4all/clark-entity';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {
  //User Information 
  name: String;
  employer: String;
  contributor = false;
  modulesCreated: LearningObject[];
  modulesDownloaded = 34; 
  title = "Student";
  email: String;
  password: String; 
  //Display Variables
  showContent = 0;
  editContent = true; 

  constructor(private service: LearningObjectService, private auth: AuthService) {
  }

  changeName() {    this.name = 'Houssein';  }
  ngOnInit() {
    const user = this.auth.user;
    this.email = user['email'];
    this.name = user['name'];
    this.employer = user['organization'];

    
    //this.modulesCreated 
  }

}
