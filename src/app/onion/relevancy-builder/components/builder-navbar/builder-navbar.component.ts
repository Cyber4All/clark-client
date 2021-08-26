import { Component, OnInit } from '@angular/core';
import { BuilderStore } from '../../builder-store.service';
import { LearningObjectValidator } from '../../validators/learning-object.validator';
import { CollectionService, Collection } from 'app/core/collection.service';
import { LearningObject } from '@entity';
import { HistoryService, HistorySnapshot } from 'app/core/history.service';

@Component({
  selector: 'onion-relevancy-builder-navbar',
  templateUrl: './builder-navbar.component.html',
  styleUrls: ['./builder-navbar.component.scss']
})
export class BuilderNavbarComponent implements OnInit {
  collection: Collection;
  // FIXME: This will need to set based on the data coming back once the service is in place
  revisedVersion = false;

  // map of state strings to icons and tooltips
  states: Map<string, { tip: string }>;
  historySnapshot: HistorySnapshot;

  constructor(
    private collectionService: CollectionService,
    private history: HistoryService,
    public validator: LearningObjectValidator,
    public store: BuilderStore
  ) {
    this.historySnapshot = this.history.snapshot();
  }

  ngOnInit(): void { }

  /**
   * Build the states map for the status tooltips and icons
   *
   * @memberof BuilderNavbarComponent
   */
  buildTooltip() {
    this.states = new Map([
      [
        LearningObject.Status.REJECTED,
        {
          tip:
            'This learning object was rejected. Contact your review team for further information'
        }
      ],
      [
        LearningObject.Status.RELEASED,
        {
          tip:
            'This learning object is published to the ' +
            (this.collection ? this.collection.name : '') +
            ' collection and can be browsed for.'
        }
      ],
      [
        LearningObject.Status.REVIEW,
        {
          tip:
            'This object is currently under review by the ' +
            (this.collection ? this.collection.name : '') +
            ' review team, It is not yet published and cannot be edited until the review process is complete.'
        }
      ],
      [
        LearningObject.Status.WAITING,
        {
          tip:
            'This learning object is waiting to be reviewed by the next available reviewer from the ' +
            (this.collection ? this.collection.name : '') +
            ' review team'
        }
      ],
      [
        LearningObject.Status.UNRELEASED,
        {
          tip:
            'This learning object is visible only to you. Submit it for review to make it publicly available.'
        }
      ]
    ]);
  }

  async save() {
    this.store.save();
    this.historySnapshot.rewind('/admin/learning-objects');
  }
}
