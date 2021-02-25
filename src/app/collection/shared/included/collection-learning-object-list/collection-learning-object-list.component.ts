import { Component, OnInit, Input } from '@angular/core';
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
  constructor(private learningObjectService: LearningObjectService) { }

  @Input() learnObj;
  learningObjects: LearningObject[];
  query: Query = {
    limit: 6,
    orderBy: OrderBy.Date,
    sortType: SortType.Descending,
    status: [LearningObject.Status.RELEASED],

  };


  ngOnInit() {
    this.query.collection = "nccp";
    this.learningObjectService.getLearningObjects(this.query).then((res) => {
      console.log(res);
      this.learningObjects = res.learningObjects;
    }).catch((err) => {
      console.log('\n \n \n \n \n');
      console.log(err);
    });
  }

}
