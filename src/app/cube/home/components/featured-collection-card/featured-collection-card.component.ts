import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'clark-featured-collection-card',
  templateUrl: './featured-collection-card.component.html',
  styleUrls: ['./featured-collection-card.component.scss']
})
export class FeaturedCollectionCardComponent implements OnInit {
  @Input() collection;
  pictureLocation!: string;
  link!: string;

  constructor() { }

  ngOnInit(): void {
    // Set the URL for the collection logo, else use the featured collection logo
    if (
      this.collection.abvName !== 'intro_to_cyber' &&
      this.collection.abvName !== 'secure_coding_community' &&
      this.collection.abvName !== 'plan c'
    ) {
      this.pictureLocation =
        '../../../assets/images/collections/' +
        this.collection.abvName +
        '.png';
    }
    if (
      this.collection.abvName === 'ncyte' ||
      this.collection.abvName === 'nice'
    ) {
      this.link = '/collections/' + this.collection.abvName;
    } else {
      this.link = '/c/' + this.collection.abvName;
    }

    if (this.collection.abvName === 'nccp') {
      this.collection.name = 'NSA Funded Curriculum';
    }

    if (this.collection.abvName === 'ncyte') {
      this.collection.name = 'National Cybersecurity Training & Education Center';
    }
  }

}
