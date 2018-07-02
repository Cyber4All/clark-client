import {
  Component, OnInit, Input, EventEmitter, Output, TemplateRef, ContentChildren, QueryList, AfterContentInit
} from '@angular/core';

@Component({
  selector: 'clark-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss']
})
export class FilterComponent implements OnInit, AfterContentInit {
  @Input() filters: FilterSection[];
  @Input() display: 'horizontal' | 'vertical' = 'horizontal';

  @Output() add: EventEmitter<{category: string, filter: string}> = new EventEmitter();
  @Output() remove: EventEmitter<{category: string, filter: string}> = new EventEmitter();

  @ContentChildren(TemplateRef) template: QueryList<TemplateRef<any>>;

  constructor() { }

  ngOnInit() {
  }

  ngAfterContentInit() {
    const indexes = [];

    for (let i = 0, l = this.filters.length; i < l; i++) {
      if (this.filters[i].type === 'custom') {
        indexes.push(i);
      }
    }

    this.template.forEach((item, index) => {
      this.filters[indexes[index]].template = item;
    });

  }

  addFilter(category: string, filter: string) {

    this.add.emit({category, filter});
  }

  removeFilter(category: string, filter: string) {
    this.remove.emit({category, filter});
  }
}

export interface FilterSection {
  name: string;
  type: 'select-many' | 'dropdown-one' | 'custom';
  canSearch?: boolean;
  values?: {
    name: string;
    initial: boolean;
    active?: boolean;
    toolTip?: string;
  }[];
  template?: TemplateRef<any>;
}
