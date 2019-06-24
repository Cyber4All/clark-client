import { Component, OnInit, Input } from '@angular/core';
import { LearningObject } from '@entity';
import { BehaviorSubject } from 'rxjs';
import { RatingService } from 'app/core/rating.service';
import { Rating } from 'app/cube/details/details.component';

@Component({
  selector: 'clark-side-panel-content',
  templateUrl: './side-panel-content.component.html',
  styleUrls: ['./side-panel-content.component.scss']
})
export class SidePanelContentComponent implements OnInit {

  @Input() controller$: BehaviorSubject<boolean>;

  @Input() learningObject: LearningObject;

  ratings: any[];
  averageRating: number;
  loadingRatings: boolean;

  constructor(private ratingService: RatingService) { }

  ngOnInit() {
    this.loadingRatings = true;
    this.ratingService.getLearningObjectRatings({ learningObjectId: this.learningObject.id }).then(val => {
      console.log(val)
      this.averageRating = val.avgValue;
      this.ratings = val.ratings;

      this.loadingRatings = true;
    });
  }

  close() {
    this.controller$.next(false);
  }

}
