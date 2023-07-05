import { Component, OnDestroy, OnInit } from '@angular/core';
import { Collection, LearningObject } from '@entity';
import { CollectionService } from 'app/core/collection.service';
import { FeaturedObjectsService } from 'app/core/featuredObjects.service';
import { NavbarService } from '../../../core/navbar.service';

@Component({
  selector: 'clark-security-injections',
  templateUrl: './security-injections.component.html',
  styleUrls: ['./security-injections.component.scss']
})
export class SecurityInjectionsComponent implements OnInit, OnDestroy {

  abvCollection = 'secinj';
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
