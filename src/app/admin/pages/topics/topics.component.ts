import { Component, OnInit } from '@angular/core';
import { LearningObject } from 'entity/learning-object/learning-object';
import { LearningObjectService } from 'app/core/learning-object.service';
import { Query } from 'app/interfaces/query';


@Component({
  selector: 'clark-topics',
  templateUrl: './topics.component.html',
  styleUrls: ['./topics.component.scss']
})
export class TopicsComponent implements OnInit {

  learningObjects: LearningObject[];
  
  query: Query = {
    currPage: 1,
    limit: 20,
    text: ''
  };

  constructor(private learningObjectService: LearningObjectService ) { }

  ngOnInit() {
    this.getLearningObjects();
  }

  async getLearningObjects() {
    const response = await this.learningObjectService.fetchUnassignedLearningObjects();
    this.learningObjects = response['unassigned_learning_objects'];
  }
}
