import { LearningObjectService } from './../../learning-object.service';
import { UserService } from './../../../core/user.service';
import { Http } from '@angular/http';
import { USER_ROUTES, PUBLIC_LEARNING_OBJECT_ROUTES } from './../../../../environments/route';
import { Component, OnInit, Input, SimpleChanges, OnChanges } from '@angular/core';
import { User, LearningObject } from '@cyber4all/clark-entity';

@Component({
  selector: 'user-card',
  templateUrl: './user-card.component.html',
  styleUrls: ['./user-card.component.scss']
})
export class UserCardComponent implements OnInit, OnChanges {
  @Input() user: User
  objects: Array<LearningObject>;
  icon:string;
  imgSize: number;
  constructor(private http: Http, private learningObjectService: LearningObjectService, private userService: UserService) { }
  ngOnInit() {
    this.imgSize = 100;
    this.icon = this.userService.getGravatarImage(this.user.email, this.imgSize);
  }
  ngOnChanges(changes: SimpleChanges) {
    this.fetchLearningObjects();
  }
  async fetchLearningObjects() {
    this.objects = await this.learningObjectService.getUsersLearningObjects(this.user.username);
  }
}
