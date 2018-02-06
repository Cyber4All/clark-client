import { LearningObject } from '@cyber4all/clark-entity';
import { Component, OnInit } from '@angular/core';
import { LearningObjectService } from '../../learning-object.service';

@Component({
  selector: 'app-featured',
  templateUrl: './featured.component.html',
  styleUrls: ['./featured.component.scss']
})
export class FeaturedComponent implements OnInit {
  learningObjects: LearningObject[];
  featuredLimit: number;
  constructor(private learningObjectService: LearningObjectService) {
  }

  ngOnInit() {
    this.featuredLimit = 10;
    this.fetchLearningObjects();
  }

  async fetchLearningObjects() {
    this.learningObjects = await this.learningObjectService.getLearningObjects(null,this.featuredLimit);
  }

}
