import { Component, OnInit, Input } from '@angular/core';
import { FeaturedObjectsService } from 'app/core/feature-module/featured.service';
import { OrderBy, Query, SortType } from 'app/interfaces/query';
import { LearningObject } from 'entity/learning-object/learning-object';



@Component({
  selector: 'clark-collection-learning-object-list',
  templateUrl: './collection-learning-object-list.component.html',
  styleUrls: ['./collection-learning-object-list.component.scss']
})
export class CollectionLearningObjectListComponent implements OnInit {
  @Input() collectionName: string;
  constructor(private featureService: FeaturedObjectsService) { }

  learningObjects: LearningObject[];
  query: Query = {
    limit: 6,
    orderBy: OrderBy.Date,
    sortType: SortType.Descending,
    status: [LearningObject.Status.RELEASED],

  };


  async ngOnInit() {
    this.query.collection = this.collectionName;
    this.learningObjects = await this.featureService.getCollectionFeaturedWithLimit(this.collectionName, this.query.limit);
  }

}
