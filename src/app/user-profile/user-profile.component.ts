import { Component, OnInit } from '@angular/core';
import { LearningObjectService } from '../learning-object.service';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {

  name = "Sean Donnelly";
  employer = "Towson University";
  contributor = false;
  modulesCreated: 20;
  email = "sdonne5@gmail.com"

  constructor(private service: LearningObjectService) {

  }

  changeName() {    this.name = 'Houssein';  }
  ngOnInit() {
    let user = localStorage.getItem("currentUser");
    user = JSON.parse(user)
    this.email = user["_email"];
    this.name = user["_name"];
  }

}
