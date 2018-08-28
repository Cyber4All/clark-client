import { Component, OnInit, Input } from '@angular/core';
import { LearningObject } from '@cyber4all/clark-entity';
import { UserService } from '../../../core/user.service';

@Component({
  selector: 'cube-details-splash',
  styleUrls: ['details-splash.component.scss'],
  templateUrl: 'details-splash.component.html'
})
export class DetailsSplashComponent implements OnInit {
  @Input() learningObject: LearningObject;

  constructor(private userService: UserService) { }

  ngOnInit() {


  }
}
