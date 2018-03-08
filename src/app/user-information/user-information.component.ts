import { USER_ROUTES } from '../../environments/route';
import { Component, OnInit } from '@angular/core';
import { LearningObjectService } from '../learning-object.service';
import { AuthService } from '../auth/services/auth.service';
import { LearningObject } from '@cyber4all/clark-entity';
import { Http, Headers, ResponseContentType } from '@angular/http';

@Component({
  selector: 'app-user-information',
  templateUrl: './user-information.component.html',
  styleUrls: ['./user-information.component.css']
})

export class UserInformationComponent implements OnInit {
  //User Information 
  name: String;
  employer: String;
  contributor = false;
  //modulesCreated: LearningObject[];
  //modulesCreated: number; 
  email: String;
  password: String;
  username: String; 
  //Display Variables
  showContent = 0;
  editContent = true;
  private headers = new Headers();

  public modules: Array<LearningObject> = [];

  constructor(private service: LearningObjectService, private auth: AuthService, private http: Http) { }

  changeName() { this.name = 'Houssein'; }
  ngOnInit() {
    const user = this.auth.user;
    this.email = user['email'];
    this.name = user['name'];
    this.employer = user['organization'];
    this.username = user['username']; 
    //console.log(this.modulesCreated); 
  }

  getModules(reloadUser = false): Promise<Array<LearningObject>> | boolean {
    return (this.auth.user) ? this.http.get(USER_ROUTES.GET_MY_LEARNING_OBJECTS(this.username), {withCredentials: true,  headers: this.headers })
      .toPromise()
      .then(val => {
        this.modules = <Array<LearningObject>>val.json();
        return this.modules;
      }) : false;
  }
}
