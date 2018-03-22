import { LearningObject } from '@cyber4all/clark-entity';
import { Component, OnInit } from '@angular/core';
import { LearningObjectService } from '../../learning-object.service';
import { Query, OrderBy, SortType } from '../../../shared/interfaces/query';

@Component({
  selector: 'cube-featured',
  templateUrl: './featured.component.html',
  styleUrls: ['./featured.component.scss']
})
export class FeaturedComponent implements OnInit {
  learningObjects: LearningObject[];
  query: Query= {
    limit: 5,
    orderBy: OrderBy.Date,
    sortType: SortType.Descending
  };
  constructor(private learningObjectService: LearningObjectService) {
  }

  ngOnInit() {
    this.fetchLearningObjects();
  }

  async fetchLearningObjects() {
    try {
      this.learningObjects = await this.learningObjectService.getLearningObjects(this.query);
    } catch (e) {
      
    }
  }

}
