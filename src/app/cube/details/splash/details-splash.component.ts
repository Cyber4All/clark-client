import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { LearningObject } from '@entity';
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
  @Input() canViewChangelogs: boolean;
  @Output() openChangelogModal: EventEmitter<boolean> = new EventEmitter();
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
   * Emits an event to parent component to signal the change logs modal to open
   */
  openViewAllChangelogsModal() {
    this.openChangelogModal.emit(true);
  }

  /**
   * Retrieve image for collection based on collection property in learning object
   */
  get collectionImage() {
    return `${this.learningObject.collection}.png`;
  }
}
