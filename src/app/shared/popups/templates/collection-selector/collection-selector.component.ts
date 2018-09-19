import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'clark-collection-selector',
  templateUrl: './collection-selector.component.html',
  styleUrls: ['./collection-selector.component.scss']
})
export class CollectionSelectorComponent implements OnInit {

  @Output() choice: EventEmitter<string> = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }

}
