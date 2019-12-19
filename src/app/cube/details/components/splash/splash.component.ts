import { Component, Input, AfterViewInit, ViewChild, ElementRef, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { LearningObject } from '@entity';
import { CollectionService } from 'app/core/collection.service';

@Component({
  selector: 'clark-details-splash',
  templateUrl: './splash.component.html',
  styleUrls: ['./splash.component.scss']
})
export class SplashComponent implements AfterViewInit {
  @Input() learningObject: LearningObject;

  collections = new Map();

  constructor(
    private collectionService: CollectionService,
  ) {}

  ngAfterViewInit() {
    this.collectionService.getCollections().then(collections => {
      this.collections = new Map(collections.map(c => [c.abvName, c.name] as [string, string]));
    });
  }

}
