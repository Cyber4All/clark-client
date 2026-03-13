import { LearningObject } from '@entity';
import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { Query, OrderBy, SortType } from '../../../interfaces/query';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FeaturedObjectsService } from 'app/core/feature-module/featured.service';
import { SearchService } from 'app/core/learning-object-module/search/search.service';
import { TopicsService } from 'app/core/learning-object-module/topics/topics.service';
import { TagsService } from 'app/core/learning-object-module/tags/tags.service';

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

  constructor(
    private searchLearningObjectService: SearchService,
    private cd: ChangeDetectorRef
  ) {
    this.learningObjects = Array.from({ length: 5 }, () => new LearningObject()); // placeholder array for loading state
  }

  async ngOnInit() {

  this.collection
    .pipe(takeUntil(this.destroyed$))
    .subscribe(collection => {
      this.collectionName = collection;
      this.query.collection = collection;

      this.fetchLearningObjects();
    });
  }

  async fetchLearningObjects() {
    this.loading = true;

    try {
      this.learningObjects = (await this.searchLearningObjectService.getLearningObjects(
        this.query
      )).learningObjects;
      this.loading = false;
      this.cd.detectChanges();
    } catch (e) {
      this.loading = false;
      this.cd.detectChanges();
    }
  }
}
