import { Component, OnInit, Input } from '@angular/core';
import { LearningObject } from '@entity';

@Component({
  selector: 'cube-parent-listing',
  template: `
    <div class="parent-listing" [ngClass]="parent.length">
      <span class="type">{{ parent.length }}</span>
      <a [routerLink]="[buildLink(parent)]">
        {{ parent.name }}
      </a>
    </div>
  `,
  styleUrls: ['parent-listing.component.scss']
})

export class ParentListingComponent implements OnInit {
  @Input() parent;

  constructor() { }

  ngOnInit() { }

  public buildLink(learningObject: LearningObject) {
    return `/details/${learningObject.author.username}/${encodeURIComponent(learningObject.name)}`;
  }
}
