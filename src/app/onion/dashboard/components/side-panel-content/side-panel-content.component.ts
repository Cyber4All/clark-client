import { Component, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { LearningObject } from '@entity';
import { BehaviorSubject } from 'rxjs';
import { RatingService } from 'app/core/rating.service';
import { trigger, style, animate, transition } from '@angular/animations';
import { LearningObjectService } from 'app/onion/core/learning-object.service';
import { environment } from '@env/environment';


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

  @Output() createRevision: EventEmitter<LearningObject> = new EventEmitter();
  // FIXME will use flag when backend is implemented
  hasRevision = environment.experimental;
  revision: LearningObject;

  constructor(
    private ratingService: RatingService,
    private learningObjectService: LearningObjectService
    ) { }

  ngOnChanges(changes: SimpleChanges) {
    // loading the ratings for the object when the Learning Object input changes
    this.loadingRatings = true;
    this.ratingService.getLearningObjectRatings({
      username: this.learningObject.author.username,
      CUID: this.learningObject.cuid,
      version: this.learningObject.revision,
    }).then(val => {
      this.averageRating = val ? val.avgValue : 0;
      this.ratings = val ? val.ratings : [];

      this.loadingRatings = false;
    });
    if (environment.experimental) {
      this.learningObjectService.getLearningObjectRevision(
        this.learningObject.author.username, this.learningObject.id, this.learningObject.revision)
        .then(revision => {
        this.revision = revision;
      });
    }
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
