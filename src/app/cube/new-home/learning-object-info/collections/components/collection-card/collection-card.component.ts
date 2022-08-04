import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'clark-collection-card',
  templateUrl: './collection-card.component.html',
  styleUrls: ['./collection-card.component.scss']
})
export class CollectionCardComponent implements OnInit {

  @Input() data: { image: string, title: string, link: string[]};

  constructor() { }

  ngOnInit(): void {
  }

}
