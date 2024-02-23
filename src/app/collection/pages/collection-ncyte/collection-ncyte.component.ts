import { Component, OnDestroy, OnInit } from '@angular/core';
import { Collection, LearningObject } from '@entity';
import { CollectionService } from 'app/core/collection-module/collections.service';
import { FeaturedObjectsService } from 'app/core/feature-module/featured.service';
import { NavbarService } from '../../../core/navbar.service';
import { Title } from '@angular/platform-browser';

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
    private titleService: Title,
    private featureService: FeaturedObjectsService) { }

  async ngOnInit() {
    this.navbarService.show();

    this.collection = await this.collectionService.getCollection(this.abvCollection);

    this.learningObjects = await this.featureService.getCollectionFeatured(this.abvCollection);

    this.titleService.setTitle('CLARK | ' + this.collection.name);
  }

  ngOnDestroy(): void {
    this.navbarService.hide();
  }
}
