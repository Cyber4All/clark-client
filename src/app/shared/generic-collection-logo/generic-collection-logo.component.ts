import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'clark-generic-collection-logo',
  templateUrl: './generic-collection-logo.component.html',
  styleUrls: ['./generic-collection-logo.component.scss']
})
export class GenericCollectionLogoComponent implements OnInit {
  @Input() size: string;

  constructor() { }

  ngOnInit() {
  }

}
