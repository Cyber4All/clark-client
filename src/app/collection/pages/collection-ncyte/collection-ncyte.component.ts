import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Collection, LearningObject } from '@entity';
import { CollectionService } from 'app/core/collection.service';
import { FeaturedObjectsService } from 'app/core/featuredObjects.service';
import { LearningObjectService } from 'app/cube/learning-object.service';
import { NavbarService } from '../../../core/navbar.service';


@Component({
  selector: 'clark-collection-ncyte',
  templateUrl: './collection-ncyte.component.html',
  styleUrls: ['./collection-ncyte.component.scss']
})
export class CollectionNcyteComponent implements OnInit, OnDestroy {

  abvCollection = 'ncyte';
  collection: Collection;
  learningObjects: LearningObject[];

  constructor(
    private navbarService: NavbarService,
    private collectionService: CollectionService,
    private featureService: FeaturedObjectsService) { }

  async ngOnInit() {
    this.navbarService.show();

    this.collection = await this.collectionService.getCollection(this.abvCollection);

    this.learningObjects = await this.featureService.getCollectionFeatured(this.abvCollection);
  }

  ngOnDestroy(): void {
    this.navbarService.hide();
  }
}
