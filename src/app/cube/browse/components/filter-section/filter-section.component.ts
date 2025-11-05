import { ChangeDetectorRef, Component, OnInit, Input, Output, EventEmitter, DoCheck } from '@angular/core';
@Component({
  selector: 'clark-filter-section',
  templateUrl: './filter-section.component.html',
  styleUrls: ['./filter-section.component.scss']
})
export class FilterSectionComponent implements OnInit, DoCheck {
  private _info?: FilterSectionInfo;

  @Input() set info(value: FilterSectionInfo | undefined) {
    this._info = value;

    // default is collapsed = true unless this is the Length or Level section
    this.collapsed = !this.isLockedSection(value);

    // If any filter is already active, force open
    if (value?.filters?.some(f => f.active)) {
      this.collapsed = false;
    }

    // If this is Length or Level, lock open
    if (this.isLockedSection(value)) {
      this.collapsed = false;
    }

    this.cd.detectChanges();
  }
  get info(): FilterSectionInfo | undefined {
    return this._info;
  }

  @Output() change = new EventEmitter();

  collapsed = true;

  constructor(
    private cd: ChangeDetectorRef,
  ) { }

  ngOnInit() { }

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
    if (this.isLockedSection(this.info)) {
      this.collapsed = false;   // ignore attempts to collapse
      return;
    }
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

  private isLockedSection(v?: FilterSectionInfo) {
    const s = v?.section?.trim().toLowerCase();
    return s === 'length' || s === 'level';
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
    description?: string;
    icon?: string;
  }[];
}
