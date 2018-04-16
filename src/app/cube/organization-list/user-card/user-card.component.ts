import { Http } from '@angular/http';
import { USER_ROUTES, PUBLIC_LEARNING_OBJECT_ROUTES } from './../../../../environments/route';
import { Component, OnInit, Input, SimpleChanges, OnChanges } from '@angular/core';
import { User, LearningObject } from '@cyber4all/clark-entity';
import * as md5 from 'md5';

@Component({
  selector: 'user-card',
  templateUrl: './user-card.component.html',
  styleUrls: ['./user-card.component.scss']
})
export class UserCardComponent implements OnInit, OnChanges {
  @Input() user: User
  objects: Array<LearningObject>;
  default: String;
  imgSize: number;
  constructor(private http: Http) { }
  ngOnInit() {
    console.log(this.user)
    this.default = 'identicon';
    this.imgSize = 100;
  }
  ngOnChanges(changes: SimpleChanges) {
    this.getUsersLearningObjects();
  }
  getGravatarImage(): string {
    // r=pg checks the rating of the Gravatar image 
    return 'http://www.gravatar.com/avatar/' + md5(this.user.email) + '?s=' + this.imgSize +
      '?r=pg&d=' + this.default;
  }
  async getUsersLearningObjects(): Promise<void> {
    let route = PUBLIC_LEARNING_OBJECT_ROUTES.GET_USERS_PUBLIC_LEARNING_OBJECTS(
        this.user.username
      );

    return this.http
      .get(route, { withCredentials: true })
      .toPromise()
      .then(val => {
        this.objects = <Array<LearningObject>>val
            .json()
            .map(l => LearningObject.instantiate(l));
      });
  }
  

}
