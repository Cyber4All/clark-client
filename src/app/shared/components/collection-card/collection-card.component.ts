import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'clark-collection-card',
  templateUrl: './collection-card.component.html',
  styleUrls: ['./collection-card.component.scss']
})
export class CollectionCardComponent implements OnInit {

  @Input() collection;
  pictureLocation: string;

  constructor() { }

  ngOnInit() {
    // Set the URL for the collection logo, else use the featured collection logo
    if (this.collection.abvName !== 'intro_to_cyber' && this.collection.abvName !== 'secure_coding_community') {
      this.pictureLocation = '../../../assets/images/collections/' + this.collection.abvName + '.png';
    }
  }

}
