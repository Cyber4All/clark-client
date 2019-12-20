import { Component, Input, AfterViewInit } from '@angular/core';
import { LearningObject } from '@entity';
import { CollectionService } from 'app/core/collection.service';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'clark-details-splash',
  templateUrl: './splash.component.html',
  styleUrls: ['./splash.component.scss'],
  animations: [
    trigger('collection', [
      transition(':enter', [
        style({ opacity: 0, height: 0 }),
        animate('200ms ease', style({ opacity: 1, height: '*' }))
      ])
    ])
  ]
})
export class SplashComponent implements AfterViewInit {
  @Input() learningObject: LearningObject;
  @Input() averageRating: number;
  @Input() reviewsCount:  number;

  @Input() parents: LearningObject[];
  @Input() children: LearningObject[];

  showPanel: boolean;

  starColor = 'gold';

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
