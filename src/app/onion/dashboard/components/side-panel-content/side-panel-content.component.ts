import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { LearningObject } from '@entity';
import { BehaviorSubject } from 'rxjs';
import { RatingService } from 'app/core/rating.service';
import { Rating } from 'app/cube/details/details.component';

@Component({
  selector: 'clark-side-panel-content',
  templateUrl: './side-panel-content.component.html',
  styleUrls: ['./side-panel-content.component.scss']
})
export class SidePanelContentComponent implements OnInit, OnChanges {

  @Input() controller$: BehaviorSubject<boolean>;

  @Input() learningObject: LearningObject;

  ratings: any[];
  averageRating: number;
  loadingRatings: boolean;

  constructor(private ratingService: RatingService) { }

  ngOnInit() {

  }

  ngOnChanges(changes: SimpleChanges) {
    console.log('TRIGGERING');
    this.loadingRatings = true;
    this.ratingService.getLearningObjectRatings({ learningObjectId: this.learningObject.id }).then(val => {
      this.averageRating = val ? val.avgValue : 0;
      this.ratings = val ? val.ratings : [];

      this.loadingRatings = true;
    });
  }

  close() {
    this.controller$.next(false);
  }

}
