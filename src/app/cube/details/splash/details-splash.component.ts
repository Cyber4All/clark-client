import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { LearningObject } from '@cyber4all/clark-entity';
import { UserService } from '../../../core/user.service';

@Component({
  selector: 'cube-details-splash',
  styleUrls: ['details-splash.component.scss'],
  templateUrl: 'details-splash.component.html'
})
export class DetailsSplashComponent implements OnInit {
  @Input() learningObject: LearningObject;
  @Input() ratings: any[];
  @Input() averageRating: number;
  @Input() canRate: boolean;
  @Output() showNewRating: EventEmitter<boolean> = new EventEmitter();

  constructor(private userService: UserService) { }

  ngOnInit() {


  }

  showRatingPopup() {
    this.showNewRating.emit(true);
  }
}
