import { ChangeDetectorRef, Component, DoCheck, EventEmitter, Input, OnInit, Output } from '@angular/core';
@Component({
  selector: 'clark-filter-section',
  templateUrl: './filter-section.component.html',
  styleUrls: ['./filter-section.component.scss']
})
export class FilterSectionComponent implements OnInit, DoCheck {
  private _info?: FilterSectionInfo;
  private _collapsed = false;

  @Input() set info(value: FilterSectionInfo | undefined) {
    this._info = value;

    // Default: all sections are open (expanded)
  }
  get info(): FilterSectionInfo | undefined {
    return this._info;
  }

  @Input() set collapsed(value: boolean) {
    this._collapsed = value;
    this.cd.detectChanges();
  }
  get collapsed(): boolean {
    return this._collapsed;
  }

  @Output() change = new EventEmitter();

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
    if (!this.info) return;
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
    if (!this.info) return;
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

  /**
   * Get the count of active (selected) filters in this section
   */
  getActiveCount(): number {
    if (!this.info?.filters) {
      return 0;
    }
    return this.info.filters.filter(f => f.active).length;
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
  }[];
}
