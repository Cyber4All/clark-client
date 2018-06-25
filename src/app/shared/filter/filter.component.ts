import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'clark-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss']
})
export class FilterComponent implements OnInit {
  @Input() filters: FilterSection[];
  @Input() display: 'horizontal' | 'vertical' = 'horizontal';

  @Output() add: EventEmitter<{category: string, filter: string}> = new EventEmitter();
  @Output() remove: EventEmitter<{category: string, filter: string}> = new EventEmitter();

  constructor() { }

  ngOnInit() { }

  addFilter(category: string, filter: string) {
    this.add.emit({category, filter});
  }

  removeFilter(category: string, filter: string) {
    this.remove.emit({category, filter});
  }

}

export interface FilterSection {
  name: string;
  type: 'select-one' | 'select-many' | 'dropdown-one';
  canSearch: boolean;
  values: {
    name: string;
    initial: boolean;
    active?: boolean;
    toolTip?: string;
  }[];
}
