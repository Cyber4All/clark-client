import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { LearningObject } from '@cyber4all/clark-entity';
import { CollectionService } from '../../../core/collection.service';

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
  @Input() owned: boolean;
  @Output() showNewRating: EventEmitter<boolean> = new EventEmitter();

  collections = new Map();

  constructor(private collectionService: CollectionService) { }

  ngOnInit() {
    this.collectionService.getCollections().then(collections => {
      this.collections = new Map(collections.map(c => [c.abvName, c.name] as [string, string]));
    });
  }
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
    // FIXME this should not be done with an if-statement, switch case or potentially API side
    switch (this.learningObject.collection) {
      case 'gencyber':
        return 'gencyber.png';
      case 'nccp':
        return 'nccp.png';
      case 'secinj':
        return 'secinj.png';
      case 'c5':
        return 'c5.png';
    }
  }
}
