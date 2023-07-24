import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { LearningObject } from '@entity';
import { CollectionService } from 'app/core/collection.service';
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
  isDesktop: boolean;

  constructor(
    private navbarService: NavbarService,
    private collectionService: CollectionService,
    private router: Router,
    ) {
      this.isDesktop = window.innerWidth >= 768;
    }

    @HostListener('window:resize', ['$event'])
    onResize(event: Event) {
    this.isDesktop = window.innerWidth >= 768;
    }

  async ngOnInit() {

    this.navbarService.show();

    this.collection = await this.collectionService.getCollection(this.abvCollection);

    this.collection = await this.collectionService.getCollectionMetadata(this.abvCollection).catch(e => {
      if (e.status === 404) {
        this.router.navigate(['not-found']);
      }
    });
  }

  ngOnDestroy(): void {
    this.navbarService.hide();
  }
}
