import { Component, OnInit, Input } from '@angular/core';
import { SearchService } from 'app/core/learning-object-module/search/search.service';
import { LearningObjectService } from 'app/cube/learning-object.service';
import { OrderBy, Query, SortType } from 'app/interfaces/query';
import { LearningObject } from 'entity/learning-object/learning-object';



@Component({
  selector: 'clark-collection-learning-object-list',
  templateUrl: './collection-learning-object-list.component.html',
  styleUrls: ['./collection-learning-object-list.component.scss']
})
export class CollectionLearningObjectListComponent implements OnInit {
  @Input() collectionName: string;
  constructor(private searchLearningObjectService: SearchService) { }

  learningObjects: LearningObject[];
  query: Query = {
    limit: 6,
    orderBy: OrderBy.Date,
    sortType: SortType.Descending,
    status: [LearningObject.Status.RELEASED],

  };


  async ngOnInit() {
    this.query.collection = this.collectionName;
    this.searchLearningObjectService.getLearningObjects(this.query).then((res) => {
      this.learningObjects = res.learningObjects;
    });
  }

}
