import { Component, OnDestroy, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { LearningObject } from '@entity';
import { CollectionService } from 'app/core/collection.service';
import { FeaturedObjectsService } from 'app/core/featuredObjects.service';
import { NavbarService } from '../../../core/navbar.service';
import { Collection, LearningObject } from '@entity';
import { CollectionService } from 'app/core/collection.service';
import { FeaturedObjectsService } from 'app/core/featuredObjects.service';
import { NavbarService } from '../../../core/navbar.service';

@Component({
  selector: 'clark-security-injections',
  templateUrl: './security-injections.component.html',
  styleUrls: ['./security-injections.component.scss'],
})
export class SecurityInjectionsComponent implements OnInit, OnDestroy {

  abvCollection = 'secinj';
  collection;
  learningObjects: LearningObject[];

  constructor(
    private navbarService: NavbarService,
    private collectionService: CollectionService,
    private featureService: FeaturedObjectsService,
    private router: Router,
    ) { }

  async ngOnInit() {
    this.navbarService.show();

    this.collection = await this.collectionService.getCollection(this.abvCollection);

    this.collection = await this.collectionService.getCollectionMetadata(this.abvCollection).catch(e => {
      if (e.status === 404) {
        this.router.navigate(['not-found']);
      }
    });

    this.learningObjects = await this.featureService.getCollectionFeatured(this.abvCollection);

  }

  ngOnDestroy(): void {
    this.navbarService.hide();
  }
}
