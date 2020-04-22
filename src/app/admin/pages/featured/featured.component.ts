import { Component, OnInit } from '@angular/core';
import { LearningObject } from '@entity';
import { FeaturedService } from 'app/core/featured.service';
import { LearningObjectService } from 'app/cube/learning-object.service';
import { Query } from 'app/interfaces/query';
@Component({
  selector: 'clark-featured',
  templateUrl: './featured.component.html',
  styleUrls: ['./featured.component.scss'],
  providers: [LearningObjectService]
})
export class FeaturedComponent implements OnInit {
  // Object Arrays
  learningObjects: LearningObject[];
  featuredObjects: LearningObject[];


  // Query for retrieve
  query: Query = {
    limit: 20,
    status: [LearningObject.Status.RELEASED]
  };
  constructor(
    private featureService: FeaturedService
  ) { }

  async ngOnInit() {
    this.featuredObjects = await this.featureService.getFeaturedObjects();
    this.learningObjects = (await this.featureService.getNotFeaturedLearningObjects(this.featuredObjects, this.query)).learningObjects;
  }

  saveFeatured() {

  }
}



