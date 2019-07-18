import { Component, Input, Output, EventEmitter } from '@angular/core';
import { LearningObject } from '@entity';

@Component({
  selector: 'clark-dashboard-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent {
  @Input() showOptions: boolean;
  @Input() learningObjects: LearningObject[];
  @Input() title: string;
  @Output() applyFilters: EventEmitter<any> = new EventEmitter();
  filters: Map<string, boolean> = new Map();
  filterMenuDown: boolean;


  toggleFilterMenu(value) {
    this.filterMenuDown = value;
  }

  /**
   * Add or remove filter from filters list
   * @param filter {string} the filter to be toggled
   */
  toggleFilter(filter: string) {
    if (this.filters.get(filter)) {
      this.filters.delete(filter);

    } else {
      this.filters.set(filter, true);
    }
    this.applyFilters.emit(this.filters);
  }

  clearFilters() {
    this.filters.clear();
    this.applyFilters.emit(this.filters);
  }

}
