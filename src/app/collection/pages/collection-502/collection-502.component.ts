import { Component,OnDestroy, OnInit } from '@angular/core';
import { Collection, LearningObject } from '@entity';
import { CollectionService } from 'app/core/collection.service';
import { FeaturedObjectsService } from 'app/core/featuredObjects.service';
import { NavbarService } from '../../../core/navbar.service';
import { LearningObjectService } from 'app/cube/learning-object.service';
import { Query } from 'app/interfaces/query';


@Component({
  selector: 'clark-502-collection-index',
  templateUrl: './collection-502.component.html',
  styleUrls: ['./collection-502.component.scss']
})
export class Collection502Component implements OnInit {

  abvCollection = '502_project';
  collection: Collection;
  learningObjects: LearningObject[];
  guidelineNames: [];
  loading = true;
  query = {
    limit: 5,
    collection: '502_project'
  };

  constructor(
    private navbarService: NavbarService,
    private collectionService: CollectionService,
    private learningObjectService: LearningObjectService
  ) { }

  async ngOnInit() {

    this.navbarService.show();
    this.fetchLearningObjects(this.query);

  }

  async fetchLearningObjects(query: Query) {
    this.loading = true;
    this.learningObjects = [];
    // Trim leading and trailing whitespace
    query.text = query.text ? query.text.trim() : undefined;
    try {
      const {
        learningObjects,
        total
      } = await this.learningObjectService.getLearningObjects(query);
      this.learningObjects = learningObjects;
      console.log(learningObjects);
      this.loading = false;
    } catch (e) {
      console.log(`Error: ${e}`);
    }
  }

OnDestroy(): void {
    this.navbarService.hide();
  }
}
