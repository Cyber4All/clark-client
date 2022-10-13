import { Component,OnDestroy, OnInit } from '@angular/core';
import { Collection, LearningObject } from '@entity';
import { CollectionService } from 'app/core/collection.service';
import { FeaturedObjectsService } from 'app/core/featuredObjects.service';
import { NavbarService } from '../../../core/navbar.service';


@Component({
  selector: 'clark-502-collection-index',
  templateUrl: './collection-502.component.html',
  styleUrls: ['./collection-502.component.scss']
})
export class Collection502Component implements OnInit {

  abvCollection = 'ncyte';
  collection: Collection;
  learningObjects: LearningObject[];

  constructor(
    private navbarService: NavbarService,
    private collectionService: CollectionService,
    private featureService: FeaturedObjectsService
  ) { }

  async ngOnInit() {

    this.navbarService.show();

    this.collection = await this.collectionService.getCollection(this.abvCollection);

    this.learningObjects = await this.featureService.getCollectionFeatured(this.abvCollection);

  }

OnDestroy(): void {
    this.navbarService.hide();
  }
}
