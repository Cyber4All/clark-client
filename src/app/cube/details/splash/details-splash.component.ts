import { Component, Input, Output, EventEmitter } from '@angular/core';
import { LearningObject } from '@cyber4all/clark-entity';
import { setCurrentInjector } from '@angular/core/src/di/injector';

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
  @Input() owned: boolean;
  @Output() showNewRating: EventEmitter<boolean> = new EventEmitter();

  collections = new Map([['nccp', 'NSA NCCP'], ['gencyber', 'GenCyber'], ['secinj', 'Security Injections']]);

  /**
   * Emits an event to parent component to signal the ratings popup to open
   */
  showRatingPopup() {
    this.showNewRating.emit(true);
  }

  /**
   * Retrieve image for collection based on collection property in learning object
   */
  get collectionImage() {
    // FIXME this should potentially be done API side
    console.log(this.learningObject.collection);
    switch (this.learningObject.collection) {
      case 'gencyber':
        return 'gencyber.png';
      case 'nccp':
        return 'nsa.png';
      case 'secinj':
        return 'secinj.png';
    }
  }
}
