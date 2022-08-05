import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'clark-collection-item',
  templateUrl: './collection-item.component.html',
  styleUrls: ['./collection-item.component.scss']
})
export class CollectionItemComponent implements OnInit {

  @Input() data: {image: string, title: string, link: string[]};

  constructor() { }

  ngOnInit(): void {
  }

}
