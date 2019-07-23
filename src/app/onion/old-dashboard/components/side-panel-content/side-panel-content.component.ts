import { Component, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { LearningObject } from '@entity';
import { BehaviorSubject } from 'rxjs';
import { RatingService } from 'app/core/rating.service';
import { trigger, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'clark-side-panel-content',
  templateUrl: './side-panel-content.component.html',
  styleUrls: ['./side-panel-content.component.scss'],
  animations: [
   trigger('revision', [
    transition(':enter', [
      style({ opacity: 0}),
      animate('200ms 600ms ease-out', style({ 'opacity': 1})),
      ]),
    ]),
  trigger('madeRevision', [
    transition(':leave', [
      style({ opacity: 1 }),
      animate('400ms ease-out', style({ transform: 'translateY(100px)', opacity: 0 })),
    ]),
  ])
  ]
})
export class SidePanelContentComponent implements OnChanges {

  @Input() controller$: BehaviorSubject<boolean>;

  @Input() learningObject: LearningObject;

  ratings: any[];
  averageRating: number;
  loadingRatings: boolean;
  meatballOpen: boolean;

  // Output for context menu option to submit revision for review
  @Output()
  submit: EventEmitter<void> = new EventEmitter();

  // FIXME will use flag when backend is implemented
  createRevision = true;


  constructor(
    private ratingService: RatingService
    ) { }

  ngOnChanges(changes: SimpleChanges) {
    // loading the ratings for the object when the Learning Object input changes
    this.loadingRatings = true;
    this.ratingService.getLearningObjectRatings({ learningObjectId: this.learningObject.id }).then(val => {
      this.averageRating = val ? val.avgValue : 0;
      this.ratings = val ? val.ratings : [];

      this.loadingRatings = true;
    });
  }

  /**
   * Instruct the side panel directive to close the panel
   *
   * @memberof SidePanelContentComponent
   */
  close() {
    this.controller$.next(false);
  }
}
