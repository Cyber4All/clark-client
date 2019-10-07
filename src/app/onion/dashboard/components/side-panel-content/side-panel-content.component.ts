import { Component, Input, OnChanges, SimpleChanges, Output, EventEmitter, OnDestroy } from '@angular/core';
import { LearningObject } from '@entity';
import { BehaviorSubject } from 'rxjs';
import { RatingService } from 'app/core/rating.service';
import { trigger, style, animate, transition } from '@angular/animations';
import { LearningObjectService } from 'app/onion/core/learning-object.service';
import { environment } from '@env/environment';
import { UriRetrieverService } from 'app/core/uri-retriever.service';
import { takeUntil } from 'rxjs/operators';


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
export class SidePanelContentComponent implements OnChanges, OnDestroy {

  private isDestroyed$ = new Subject<void>();

  @Input() controller$: BehaviorSubject<boolean>;

  @Input() learningObjects: LearningObject[];


  ratings: any[];
  averageRating: number;
  loadingResources: boolean;
  meatballOpen: boolean;

  // Output for context menu option to submit revision for review
  @Output()
  submit: EventEmitter<void> = new EventEmitter();

  @Output() createRevision: EventEmitter<LearningObject> = new EventEmitter();
  // FIXME will use flag when backend is implemented
  hasRevision = environment.experimental;
  revisionLearningObject: LearningObject;
  releasedLearningObject: LearningObject;

  constructor(
    private ratingService: RatingService,
    private learningObjectService: LearningObjectService,
    private uriRetrieverService: UriRetrieverService,
    ) { }

  ngOnChanges(changes: SimpleChanges) {
    this.setLearningObjects();
    // loading the ratings for the object when the Learning Object input changes
    this.loadingResources = true;
    const resources = ['metrics', 'ratings'];
    // tslint:disable-next-line:max-line-length
    this.uriRetrieverService.getLearningObject({cuidInfo: { cuid: this.revisionLearningObject.cuid }}, resources).pipe(takeUntil(this.isDestroyed$)).subscribe(async (object) => {
      if (object) {
        console.log('RESOURCES', object);
      }
    });
    // this.averageRating = val ? val.avgValue : 0;
    // this.ratings = val ? val.ratings : [];

    this.loadingResources = false;
  }

  setLearningObjects() {
    const filteredRevisionLearningObjects = this.learningObjects
      .filter(learningObject => learningObject.status !== LearningObject.Status.RELEASED);
    const filteredReleasedLearningObjects = this.learningObjects
    .filter(learningObject => learningObject.status === LearningObject.Status.RELEASED);

    this.revisionLearningObject = filteredRevisionLearningObjects[0];
    this.releasedLearningObject = filteredReleasedLearningObjects[0];
  }

  /**
   * Instruct the side panel directive to close the panel
   *
   * @memberof SidePanelContentComponent
   */
  close() {
    this.controller$.next(false);
  }

  ngOnDestroy() {
    this.isDestroyed$.next();
    this.isDestroyed$.unsubscribe();
  }
}
