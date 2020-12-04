import {
  Component, Input, EventEmitter, Output, TemplateRef, ContentChildren, QueryList, AfterContentInit, ChangeDetectorRef
} from '@angular/core';
import { FilterSection } from './FilterSection';

@Component({
  selector: 'clark-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss']
})
export class FilterComponent implements AfterContentInit {
  @Input() filterSections: FilterSection[];
  @Input() display: 'horizontal' | 'vertical' = 'horizontal';

  @Output() add: EventEmitter<{category: string, filter: string, clearFirst?: boolean}> = new EventEmitter();
  @Output() remove: EventEmitter<{category: string, filter: string}> = new EventEmitter();

  @ContentChildren(TemplateRef) template: QueryList<TemplateRef<any>>;

  constructor(private readonly changeDetector: ChangeDetectorRef) {}

  ngAfterContentInit() {
    const indexes = [];

    for (let i = 0, l = this.filterSections.length; i < l; i++) {
      if (this.filterSections[i].type === 'custom') {
        indexes.push(i);
      }
    }

    this.template.forEach((item, index) => {
      this.filterSections[indexes[index]].template = item;
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

  expand(name: string): void {
    this.filterSections.find((filterSection) => filterSection.name === name).isExpanded = true;
    this.changeDetector.detectChanges();
  }

  collapse(name: string): void {
    this.filterSections.find((filterSection) => filterSection.name === name).isExpanded = false;
    this.changeDetector.detectChanges();
  }
}
