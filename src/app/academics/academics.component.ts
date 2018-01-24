
import { LearningObjectService } from './../learning-object.service';
import { Component, OnInit } from '@angular/core';
import { LearningObject } from '@cyber4all/clark-entity';
import { SortGroupsService } from '../shared/sort-groups.service';

@Component({
  selector: 'app-academics',
  templateUrl: './academics.component.html',
  styleUrls: ['./academics.component.scss']
})
export class AcademicsComponent implements OnInit {

  learningObjects: LearningObject[];
  groups;

  constructor(private learningObjectService: LearningObjectService, private sorter: SortGroupsService) { }

  ngOnInit() {
    this.fetchLearningObjects();
  }

  async fetchLearningObjects() {
    this.learningObjects = await this.learningObjectService.getLearningObjects();
    this.groups = this.sorter.sortAcademic(this.learningObjects);
  }
}
