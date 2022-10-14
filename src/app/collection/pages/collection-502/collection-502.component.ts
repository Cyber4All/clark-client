import { Component,OnDestroy, OnInit } from '@angular/core';
import { Collection, LearningObject } from '@entity';
import { CollectionService } from 'app/core/collection.service';
import { FeaturedObjectsService } from 'app/core/featuredObjects.service';
import { NavbarService } from '../../../core/navbar.service';
import { Query } from 'app/interfaces/query';


@Component({
  selector: 'clark-502-collection-index',
  templateUrl: './collection-502.component.html',
  styleUrls: ['./collection-502.component.scss']
})
export class Collection502Component implements OnInit {

  abvCollection = 'ncyte';
  collection: Collection;
  learningObjects: LearningObject[];
  loading = true;
  query = {
    limit: 5,
    collection: 'ncyte'
  };

  constructor(
    private navbarService: NavbarService,
    private collectionService: CollectionService,
    private featureService: FeaturedObjectsService
  ) { }

  async ngOnInit() {

    this.navbarService.show();

    this.fetchLearningObjects(this.query);

    // this.collection = await this.collectionService.getCollection(this.abvCollection);

    // this.learningObjects = await this.featureService.getCollectionFeatured(this.abvCollection);

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
      } = await this.collectionService.getLearningObjects(query);
      this.learningObjects = learningObjects;
      this.loading = false;
      console.log(this.learningObjects);
    } catch (e) {
      console.log(`Error: ${e}`);
    }
  }

OnDestroy(): void {
    this.navbarService.hide();
  }
}
