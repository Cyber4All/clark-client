import { ChangeDetectorRef, Component, OnInit, Input, Output, EventEmitter, DoCheck } from '@angular/core';
@Component({
  selector: 'clark-filter-section',
  templateUrl: './filter-section.component.html',
  styleUrls: ['./filter-section.component.scss']
})
export class FilterSectionComponent implements OnInit, DoCheck {
  @Input() info: FilterSectionInfo;
  @Output() change = new EventEmitter();

  collapsed: boolean;

  constructor(
    private cd: ChangeDetectorRef,
  ) { }

  ngOnInit() {
    this.collapsed = true;
  }

  ngDoCheck() {
    if (this.info !== undefined) {
      for (let i = 0; i < this.info.filters.length; i++) {
        if (this.info.filters[i].active === true) {
          this.collapsed = false;
        }
      }
    }
  }

  /**
   * Toggles the collapsed boolean on and off
   *
   * @param collapsed The boolean to set the collapsed value to
   */
  toggleCollapsed(collapsed: boolean) {
    this.collapsed = collapsed;
    this.cd.detectChanges();
  }

  /**
   * Registers that a filter option was selected
   *
   * Note: no need to emit the value up because filter has
   * the info object since its passed by reference
   *
   * @param value The value that was selected
   */
  selectOption(value: string) {
    const index = this.info.filters.findIndex(filter => filter.value === value);
    if (index >= 0) {
      this.info.filters[index].active = true;
      this.change.emit('select');
      this.cd.detectChanges();
    }
  }

  /**
   * Registers that a filter option was deselected
   *
   * Note: no need to emit the value up because filter has
   * the info object since its passed by reference
   *
   * @param value The value that was deselected
   */
  deselectOption(value: string) {
    const index = this.info.filters.findIndex(filter => filter.value === value);
    if (index >= 0) {
      this.info.filters[index].active = false;
      this.change.emit('deselect');
      this.cd.detectChanges();
    }
  }
}

export interface FilterSectionInfo {
  section: string;
  filters: {
    active: boolean;
    name: string;
    value: string;
    tip?: string;
    // Tag usage only
    tagType?: string[];
  }[];
}
