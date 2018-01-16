import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {

  name = "Sean Donnelly";
  employer = "Towson University";
  modulesCreated = "9001";

  constructor() {
    
   }

  ngOnInit() {
  }

}
