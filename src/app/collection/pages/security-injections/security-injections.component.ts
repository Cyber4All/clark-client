import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { LearningObject } from '@entity';
import { CollectionService } from 'app/core/collection-module/collections.service';
import { NavbarService } from '../../../core/client-module/navbar.service';
import { NgIf } from '@angular/common';
import { SecurityInjectionsHeaderComponent } from './components/header/header.component';
import { MatCard, MatCardContent } from '@angular/material/card';
import { FooterComponent } from '../../../cube/shared/footer/footer.component';
import { MatAccordion, MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle } from '@angular/material/expansion';

@Component({
    selector: 'clark-security-injections',
    templateUrl: './security-injections.component.html',
    styleUrls: ['./security-injections.component.scss'],
    standalone: true,
    imports: [
        NgIf,
        SecurityInjectionsHeaderComponent,
        MatCard,
        MatCardContent,
        FooterComponent,
        MatAccordion,
        MatExpansionPanel,
        MatExpansionPanelHeader,
        MatExpansionPanelTitle,
    ],
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

    this.collection = await this.collectionService.getCollectionMetadata(this.abvCollection);

  }

  ngOnDestroy(): void {
    this.navbarService.hide();
  }
}
