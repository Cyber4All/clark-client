import { LearningObject } from '@cyber4all/clark-entity';
import { Component, OnInit } from '@angular/core';
import { LearningObjectService } from '../../learning-object.service';
import { Query, OrderBy, SortType } from '../../../shared/interfaces/query';
import { COPY } from './featured.copy';

@Component({
  selector: 'cube-featured',
  templateUrl: './featured.component.html',
  styleUrls: ['./featured.component.scss']
})
export class FeaturedComponent implements OnInit {
  copy = COPY;
  learningObjects: LearningObject[] = Array(5);
  query: Query = {
    limit: 5,
    orderBy: OrderBy.Date,
    sortType: SortType.Descending,
    released: true
  };
  loading = false;

  constructor(private learningObjectService: LearningObjectService) {
    this.learningObjects = this.learningObjects.fill(new LearningObject());
}

  ngOnInit() {
    this.fetchLearningObjects();
  }

  async fetchLearningObjects() {
    this.loading = true;

    try {
      this.learningObjects = await this.learningObjectService.getLearningObjects(this.query);
      this.loading = false;
    } catch (e) {
      this.loading = false;
    }
  }

}
