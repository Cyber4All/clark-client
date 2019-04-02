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
  }

}
