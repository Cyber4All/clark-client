import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { LearningObject } from '@entity';
import { BehaviorSubject } from 'rxjs';
import { RatingService } from 'app/core/rating.service';

@Component({
  selector: 'clark-side-panel-content',
  templateUrl: './side-panel-content.component.html',
  styleUrls: ['./side-panel-content.component.scss']
})
export class SidePanelContentComponent implements OnChanges {

  @Input() controller$: BehaviorSubject<boolean>;

  @Input() learningObject: LearningObject;

  ratings: any[];
  averageRating: number;
  loadingRatings: boolean;

  // FIXME will use flag when backend is implemented
  createRevision = false;

  constructor(private ratingService: RatingService) { }

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
