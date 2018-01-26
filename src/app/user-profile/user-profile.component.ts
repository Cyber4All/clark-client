import { Component, OnInit } from '@angular/core';
import { LearningObjectService } from '../learning-object.service';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {

  name;
  employer = "Towson University";
  contributor = false;
  modulesCreated: 20;
  title = "Educator";
  email;

  constructor(private service: LearningObjectService) {
  }

  ngOnInit() {
    let user = localStorage.getItem("currentUser");
    user = JSON.parse(user)
    this.email = user["_email"];
    this.name = user["_name"];
  }

}
