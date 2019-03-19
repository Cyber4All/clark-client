import { LearningObject } from '../../../../entity/index';
import { Component, OnInit, Input } from '@angular/core';
import { LearningObjectService } from '../../learning-object.service';
import { Query, OrderBy, SortType } from '../../../shared/interfaces/query';
import { COPY } from './featured.copy';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'cube-featured',
  templateUrl: './featured.component.html',
  styleUrls: ['./featured.component.scss']
})
export class FeaturedComponent implements OnInit {
  destroyed$ = new Subject<void>();
  @Input() collection: Subject<string>;
  copy = COPY;
  learningObjects: LearningObject[] = Array(5);
  query: Query = {
    limit: 5,
    orderBy: OrderBy.Date,
    sortType: SortType.Descending,
    status: [LearningObject.Status.RELEASED]
  };
  loading = false;

  constructor(private learningObjectService: LearningObjectService) {
    this.learningObjects = this.learningObjects.fill(new LearningObject());
  }

  ngOnInit() {
    if (this.collection) {
      this.loading = true;
      this.collection.pipe(takeUntil(this.destroyed$)).subscribe({
        next: collection => {
          this.query.collection = collection;
          this.fetchLearningObjects();
        }
      });
    } else {
      this.fetchLearningObjects();
    }
  }

  async fetchLearningObjects() {
    this.loading = true;

    try {
      this.learningObjects = (await this.learningObjectService.getLearningObjects(
        this.query
      )).learningObjects;
      this.loading = false;
    } catch (e) {
      this.loading = false;
    }
  }
}
