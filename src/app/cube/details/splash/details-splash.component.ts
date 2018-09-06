import { Component, Input, Output, EventEmitter } from '@angular/core';
import { LearningObject } from '@cyber4all/clark-entity';

@Component({
  selector: 'cube-details-splash',
  styleUrls: ['details-splash.component.scss'],
  templateUrl: 'details-splash.component.html'
})
export class DetailsSplashComponent {
  @Input() learningObject: LearningObject;
  @Input() ratings: any[];
  @Input() averageRating: number;
  @Input() canRate: boolean;
  @Output() showNewRating: EventEmitter<boolean> = new EventEmitter();

  /**
   * Emits an event to parent component to signal the ratings popup to open
   */
  showRatingPopup() {
    this.showNewRating.emit(true);
  }
}
