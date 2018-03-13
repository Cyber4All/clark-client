import { USER_ROUTES } from '../../../environments/route';
import { Component, OnInit } from '@angular/core';
import { LearningObjectService } from '../learning-object.service';
import { AuthService } from '../../core/auth.service';
import { LearningObject } from '@cyber4all/clark-entity';
import { Http, Headers, ResponseContentType } from '@angular/http';

@Component({
  selector: 'app-user-information',
  templateUrl: './user-information.component.html',
  styleUrls: ['./user-information.component.scss']
})
export class UserInformationComponent implements OnInit {
  // User Information
  name: String;
  organization: String;
  contributor = false;
  objects: LearningObject[];
  email: String;
  password: String;
  username: String;

  // Display Variables
  showContent = 0;
  editContent = true;

  constructor(
    private service: LearningObjectService,
    private auth: AuthService,
    private http: Http
  ) {}


  ngOnInit() {
    this.getUsersLearningObjects();
    const user = this.auth.user;
    this.email = user['email'];
    this.name = user['name'];
    this.organization = user['organization'];
    this.username = user['username'];
  }

  async getUsersLearningObjects(): Promise<void> {
    return this.http.get(USER_ROUTES.GET_MY_LEARNING_OBJECTS(this.username), {withCredentials: true }).toPromise().then(val => {
      this.objects = <Array<LearningObject>>val.json().map(l => LearningObject.instantiate(l));
    });
  }
}
