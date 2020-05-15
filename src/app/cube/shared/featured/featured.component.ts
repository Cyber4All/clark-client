import { LearningObject } from '@entity';
import { Component, OnInit, Input } from '@angular/core';
import { LearningObjectService } from '../../learning-object.service';
import { Query, OrderBy, SortType } from '../../../interfaces/query';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FeaturedObjectsService } from 'app/core/featuredObjects.service';

@Component({
  selector: 'cube-featured',
  templateUrl: './featured.component.html',
  styleUrls: ['./featured.component.scss']
})
export class FeaturedComponent implements OnInit {
  destroyed$ = new Subject<void>();
  @Input() collection: Subject<string>;
  learningObjects: LearningObject[] = Array(5);
  query: Query = {
    limit: 5,
    orderBy: OrderBy.Date,
    sortType: SortType.Descending,
    status: [LearningObject.Status.RELEASED]
  };
  loading = false;
  collectionName: string;

  constructor(private learningObjectService: LearningObjectService, private featureService: FeaturedObjectsService) {
    this.learningObjects = this.learningObjects.fill(new LearningObject());
  }

  ngOnInit() {
    if (this.collection) {
      this.loading = true;
      this.collection.pipe(takeUntil(this.destroyed$)).subscribe({
        next: collection => {
          this.collectionName = collection;
          this.query.collection = collection;
          this.fetchLearningObjects();
        }
      });
    } else {
      this.featureService.getFeaturedObjects();
      this.featureService.featuredObjects.subscribe(objects => {
        this.learningObjects = objects;
      })
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
