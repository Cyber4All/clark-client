import { Component, OnInit } from '@angular/core';
import { LearningObject } from '@entity';
import { FeaturedObjectsService } from 'app/core/featuredObjects.service';
import { LearningObjectService } from 'app/cube/learning-object.service';
import { Query } from 'app/interfaces/query';
import { ToastrOvenService } from 'app/shared/modules/toaster/notification.service';
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
  saveError: boolean;
  constructor(
    private featureService: FeaturedObjectsService,
    private toaster: ToastrOvenService,
  ) { }

  async ngOnInit() {
    this.featuredObjects = await this.featureService.getFeaturedObjects();
    this.learningObjects = (await this.featureService.getNotFeaturedLearningObjects(this.featuredObjects, this.query)).learningObjects;
  }

  async saveFeatured() {
    try {
      await this.featureService.setFeaturedObjects(this.featuredObjects);
    } catch (e) {
      this.toaster.error('Error!', e);
      this.saveError = true;
    }
  }
}



