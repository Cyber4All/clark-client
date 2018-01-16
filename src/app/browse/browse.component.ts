import { LearningObject } from 'clark-entity';
import { Component, OnInit } from '@angular/core';
import { LearningObjectService } from '../learning-object.service';

@Component({
  selector: 'app-browse',
  templateUrl: './browse.component.html',
  styleUrls: ['./browse.component.scss']
})
export class BrowseComponent implements OnInit {
  learningObjects: LearningObject[];

  constructor(private learningObjectService: LearningObjectService) {
  }

  ngOnInit() {
    this.fetchLearningObjects();
  }

  async fetchLearningObjects() {
    this.learningObjects = await this.learningObjectService.getLearningObjects();
  }

}
