import {
  Component, Input, EventEmitter, Output, TemplateRef, ContentChildren, QueryList, AfterContentInit
} from '@angular/core';

@Component({
  selector: 'clark-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss']
})
export class FilterComponent implements AfterContentInit {
  @Input() filters: FilterSection[];
  @Input() display: 'horizontal' | 'vertical' = 'horizontal';

  @Output() add: EventEmitter<{category: string, filter: string, clearFirst?: boolean}> = new EventEmitter();
  @Output() remove: EventEmitter<{category: string, filter: string}> = new EventEmitter();

  @ContentChildren(TemplateRef) template: QueryList<TemplateRef<any>>;

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

  /**
   * Emits signal to parent component to add specified filter to specified category
   * @param category category that target filter is in
   * @param filter filter to be toggled on
   * @param clearFirst optional boolean, set to true if all other filters in category should be cleared when
   * this is added (select-one vs select-many)
   */
  addFilter(category: string, filter: string, clearFirst?: boolean) {
    this.add.emit({category, filter, clearFirst});
  }

  /**
   * Emits to parent component signal to remove filter from specified component
   * @param category category that target filter is in
   * @param filter filter to be removed
   */
  removeFilter(category: string, filter: string) {
    this.remove.emit({category, filter});
  }
}

// The title of the FilterSection is the title that appears in the UI.
// The name of the FilterSection is the name that is sent to the backend for the specific filter.
// Determining the title here will allow us to change the title without changing backend logic for the name of the specific filter.
export interface FilterSection {
  title: string;
  name: string;
  type: 'select-many' | 'select-one' | 'dropdown-one' | 'custom';
  canSearch?: boolean;
  values?: {
    name: string;
    value?: string;
    active?: boolean;
    toolTip?: string;
  }[];
  template?: TemplateRef<any>;
}
