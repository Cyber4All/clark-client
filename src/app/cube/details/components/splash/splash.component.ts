import { Component, Input, OnInit, AfterViewInit, HostListener } from '@angular/core';
import { LearningObject, Tag } from '@entity';
import { CollectionService } from 'app/core/collection-module/collections.service';
import { trigger, transition, style, animate } from '@angular/animations';
import { TagsService } from 'app/core/learning-object-module/tags/tags.service';


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
export class SplashComponent implements OnInit, AfterViewInit {
  @Input() learningObject: LearningObject;
  @Input() averageRating: number;
  @Input() reviewsCount:  number;
  @Input() link: string;

  showPanel = false;

  starColor = 'gold';

  collections = new Map();

  showMobileSidePanel: boolean;

  fullTags = [];

  @HostListener('window:resize', []) onResize() {
    if (window.innerWidth >= 750) {
      this.showMobileSidePanel = false;
    } else {
      this.showMobileSidePanel = true;
    }
  }

  constructor(
    private collectionService: CollectionService,
    private tagsService: TagsService
  ) {}

  ngOnInit() {
    this.showMobileSidePanel = window.innerWidth < 750;
  }

  async ngAfterViewInit() {
    this.collectionService.getCollections().then(collections => {
      this.collections = new Map(collections.map(c => [c.abvName, c.name] as [string, string]));
    });

    const tags = await this.tagsService.getTags();
    // Get the full tags to pass in
    this.fullTags = tags.filter((tag: Tag) => {
      if(this.learningObject.tags.includes(tag._id)) {
        return tag;
      }
    });
  }

  showSidePanel() {
    this.showPanel = true;
  }

  hideSidePanel() {
    this.showPanel = false;
  }

}
