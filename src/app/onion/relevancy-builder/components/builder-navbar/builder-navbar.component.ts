import { Component, OnDestroy, Input } from '@angular/core';
import { BuilderStore } from '../../builder-store.service';
import { LearningObjectValidator } from '../../validators/learning-object.validator';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { CollectionService, Collection } from 'app/core/collection.service';
import { LearningObject } from '@entity';
import { HistoryService, HistorySnapshot } from 'app/core/history.service';

@Component({
  selector: 'onion-relevancy-builder-navbar',
  templateUrl: './builder-navbar.component.html',
  styleUrls: ['./builder-navbar.component.scss']
})
export class BuilderNavbarComponent implements OnDestroy {

  isSaving: boolean;
  showSubmission: boolean;
  showSubmissionOptions: boolean;

  learningObject: LearningObject;
  collection: Collection;
  // FIXME: This will need to set based on the data coming back once the service is in place
  revisedVersion = false;

  // map of state strings to icons and tooltips
  states: Map<string, { tip: string }>;

  destroyed$: Subject<void> = new Subject();

  redirectUrl: string;

  @Input() adminMode = false;

  historySnapshot: HistorySnapshot;

  constructor(
    private collectionService: CollectionService,
    private history: HistoryService,
    public validator: LearningObjectValidator,
    public store: BuilderStore
  ) {
    this.store.serviceInteraction$
      .pipe(takeUntil(this.destroyed$))
      .subscribe(params => {
        if (params) {
          this.isSaving = true;
        } else {
          this.isSaving = false;
        }
      });

    this.store.learningObjectEvent
      .pipe(
        filter(val => typeof val !== 'undefined'),
        takeUntil(this.destroyed$)
      )
      .subscribe(val => {
        this.learningObject = val;
        this.getCollection();
      });
    this.historySnapshot = this.history.snapshot();
  }

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

  /**
   * Retrieves the full Collection object from the collection service from the selected abbreviated collection
   *
   * @memberof BuilderNavbarComponent
   */
  getCollection() {
    this.collectionService
      .getCollection(this.learningObject.collection)
      .then(col => {
        this.collection = col;
        this.buildTooltip();
      });
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.unsubscribe();
  }
}
