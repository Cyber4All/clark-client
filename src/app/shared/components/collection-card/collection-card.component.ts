import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'clark-collection-card',
  templateUrl: './collection-card.component.html',
  styleUrls: ['./collection-card.component.scss'],
})
export class CollectionCardComponent implements OnInit {
  @Input() homepage = false;
  @Input() collection;
  pictureLocation: string;
  link: string;

  constructor() {}

  ngOnInit() {
    // Set the URL for the collection logo, else use the featured collection logo
    if (
      this.collection.abvName !== 'intro_to_cyber' &&
      this.collection.abvName !== 'secure_coding_community' &&
      this.collection.abvName !== 'plan c' &&
      this.collection.abvName !== 'max_power' &&
      this.collection.abvName !== 'nccp'
    ) {
      this.pictureLocation =
        '/assets/images/collections/' +
        this.collection.abvName +
        '.png';
    }
    if (
      this.collection.abvName === 'ncyte' ||
      this.collection.abvName === 'nice' ||
      this.collection.abvName === '502_project'
    ) {
      this.link = '/collections/' + this.collection.abvName;
    } else {
      this.link = '/c/' + this.collection.abvName;
    }
  }
}
