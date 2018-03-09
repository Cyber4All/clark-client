import { USER_ROUTES } from '../../../environments/route';
import { Component, OnInit } from '@angular/core';
import { LearningObjectService } from '../learning-object.service';
import { AuthService } from '../../core/auth.service';
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
  modules: LearningObject[];
  check:any; 
  array: any; 
  //modulesCreated: number; 
  email: String;
  password: String;
  username: String; 
  //Display Variables
  showContent = 0;
  editContent = true;
  private headers = new Headers();

  //public modules: Array<LearningObject> = [];

  constructor(private service: LearningObjectService, private auth: AuthService, private http: Http) { }

  changeName() { this.name = 'Houssein'; }
  ngOnInit() {
    const user = this.auth.user;
    this.email = user['email'];
    this.name = user['name'];
    this.employer = user['organization'];
    this.username = user['username']; 
    this.array = [
      { name:"scott", job:"doctor" }, 
      { name:"scott", job:"doctor" }, 
      { name:"rob", job:"doctor" } 
    ];
    //this.values(); 
       //console.log(this.modules); 
  }

  getModules(reloadUser = true) {
    return (this.auth.user) ? this.http.get(USER_ROUTES.GET_MY_LEARNING_OBJECTS(this.username)).map(
      (res) => res.json().subscribe((data) => this.modules = data, //console.log(this.modules)
     ), {withCredentials: true,  headers: this.headers }) : false;
    }

  async values() {
    const val = await this.getModules();
    if (val) {
      this.check = val;
      console.log(this.modules);
    } else {
      console.log('nothing!');
    }
  }

/*getModules(reloadUser = false): Promise<Array<LearningObject>> | boolean {
  return (this.auth.user) ? this.http.get(USER_ROUTES.GET_MY_LEARNING_OBJECTS(this.username), {withCredentials: true,  headers: this.headers })
    .toPromise()
    .then(val => {
      this.modules = <Array<LearningObject>>val.json();
      return this.modules;
    }) : false;
}*/
}