import {
  Component,
  ElementRef,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
  HostListener,
} from '@angular/core';

import { LearningObject } from '@entity';
import { ActivatedRoute } from '@angular/router';
import { FilterQuery, OrderBy, SortType } from '../../../../interfaces/query';

@Component({
  selector: 'clark-cyberskills-filters',
  templateUrl: './cyberskills-filters.component.html',
  styleUrls: [
    '../../../../admin/components/filter-search/filter-search.component.scss',
    '../../cyberskills-dashboard.component.scss',
    './cyberskills-filters.component.scss',
  ],
})
export class CyberskillsFiltersComponent implements OnInit {
  statusFilters: Set<string> = new Set();
  lengthFilters: Set<string> = new Set();

  selectedOrderBy: OrderBy;
  selectedLastUpdatedSortType?: SortType;
  selectedRatingSortType?: SortType;

  statuses = Object.values(LearningObject.Status);
  lengths = Object.values(LearningObject.Length);
  sortValues = Object.values(SortType);

  showOptions = false;

  @Output() filterQuery = new EventEmitter<FilterQuery>();
  @Output() clearAll = new EventEmitter<void>();
  @ViewChild('searchInput') searchInput: ElementRef;

  statusMenuActive: boolean;
  lengthMenuActive: boolean;
  sortDateMenuActive: boolean;
  sortRatingMenuActive: boolean;

  constructor(
    private route: ActivatedRoute,
    private elRef: ElementRef,
  ) {}

  async ngOnInit() {
    // Insert 'all' into the list of statuses
    this.statuses.splice(0, 0);

    this.statuses = this.statuses.filter(
      (s) => !['rejected', 'unreleased'].includes(s.toLowerCase()),
    );

    // Check for query params in the URL
    const qParams = this.route.parent?.snapshot.queryParamMap;
    const queryStatuses = qParams?.getAll('statuses');

    // If there are statuses in the query, apply them
    if (queryStatuses) {
      this.toggleStatusFilter(queryStatuses);
    }

    // Boolean controllers for menus
    this.statusMenuActive = false;
    this.lengthMenuActive = false;
    this.sortDateMenuActive = false;
    this.sortRatingMenuActive = false;
  }

  /**
   * Toggles the mobile "Options" menu.
   * If opening, closes all other filter menus first.
   */
  toggleOptionsMenu() {
    this.showOptions = !this.showOptions;
    // If we open the mobile "Options", close all sub-menus first
    if (this.showOptions) {
      this.closeAllMenus();
    }
  }

  /**
   * Host listener to detect clicks outside this component.
   * If the click is external, closes all menus.
   */
  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    // If the click is outside our component, close all open menus
    if (!this.elRef.nativeElement.contains(event.target)) {
      this.closeAllMenus();
    }
  }

  /**
   * Hide or show the status filter dropdown menu in mobile view
   */
  toggleStatusMenuMobile() {
    this.toggleMobileFilterMenu('statusMenuActive');
  }

  /**
   * Hide or show the length filter dropdown menu in mobile view
   */
  toggleLengthMenuMobile() {
    this.toggleMobileFilterMenu('lengthMenuActive');
  }

  /**
   * Hide or show the date filter dropdown menu in mobile view
   */
  toggleSortDateMenuMobile() {
    this.toggleMobileFilterMenu('sortDateMenuActive');
  }

  /**
   * Hide or show the rating filter dropdown menu in mobile view
   */
  toggleSortRatingMenuMobile() {
    this.toggleMobileFilterMenu('sortRatingMenuActive');
  }

  /**
   * Helper function to open/close a given menu property in mobile view.
   * Closes all other menus before opening the chosen one.
   */
  private toggleMobileFilterMenu(
    propertyName:
      | 'statusMenuActive'
      | 'lengthMenuActive'
      | 'sortDateMenuActive'
      | 'sortRatingMenuActive',
  ) {
    if (this[propertyName]) {
      // If already open, just close it
      this[propertyName] = false;
    } else {
      // Otherwise, close all menus and open this one
      this.closeAllMenus();
      this[propertyName] = true;
    }
  }

  /**
   * Closes all mobile filter menus
   */
  private closeAllMenus() {
    this.statusMenuActive = false;
    this.lengthMenuActive = false;
    this.sortDateMenuActive = false;
    this.sortRatingMenuActive = false;
  }

  /**
   * Hide or show the status filter dropdown menu in desktop view
   */
  toggleStatusMenuDesktop(value: boolean) {
    this.statusMenuActive = value;
  }

  /**
   * Hide or show the length filter dropdown menu in desktop view
   */
  toggleLengthMenuDesktop(value: boolean) {
    this.lengthMenuActive = value;
  }

  /**
   * Hide or show the date filter dropdown menu in desktop view
   */
  toggleSortDateMenuDesktop(value: boolean) {
    this.sortDateMenuActive = value;
  }

  /**
   * Hide or show the rating filter dropdown menu in desktop view
   */
  toggleSortRatingMenuDesktop(value: boolean) {
    this.sortRatingMenuActive = value;
  }

  /**
   * Toggle one or more status filters.
   * If "all" is clicked, clear them all and close the menu.
   */
  toggleStatusFilter(filters: string[]) {
    for (const filter of filters) {
      if (filter.toLowerCase() === 'all') {
        this.clearStatusFilters();
        // Close the status menu so user sees it's cleared
        this.statusMenuActive = false;
        return;
      }

      if (!this.statusFilters.has(filter)) {
        this.statusFilters.add(filter);
      } else {
        this.statusFilters.delete(filter);
      }
    }
    this.filter();
  }

  /**
   * Add or remove length filter from length filter list
   *
   * @param {string} filter the filter to be toggled
   */
  toggleLengthFilter(filters: string[]) {
    for (const filter of filters) {
      if (!this.lengthFilters.has(filter)) {
        this.lengthFilters.add(filter);
      } else {
        this.lengthFilters.delete(filter);
      }
    }
    this.filter();
  }

  /**
   * Set the sort value for last updated/created
   * @param sort the sort value for ascending or descending
   */
  setLastUpdatedSort(sort: SortType) {
    this.selectedOrderBy = OrderBy.Date;
    this.selectedLastUpdatedSortType = sort;
    // Unset rating sort
    this.selectedRatingSortType = undefined;

    this.filter();
  }

  /**
   * Set the sort value for rating.
   * @param {SortType} sort the sort value for ascending or descending
   */
  setRatingSort(sort: SortType) {
    this.selectedOrderBy = OrderBy.Rating;
    this.selectedRatingSortType = sort;
    // Unset date sort
    this.selectedLastUpdatedSortType = undefined;
    this.filter();
  }

  /**
   * Builds the FilterQuery and emits it to the parent
   */
  filter() {
    // Emit the selected filters
    const filters: FilterQuery = {
      status: Array.from(this.statusFilters),
      length: Array.from(this.lengthFilters),
      orderBy: this.selectedOrderBy,
      sortType: this.selectedLastUpdatedSortType || this.selectedRatingSortType,
    };
    this.filterQuery.emit(filters);
  }

  /**
   * Remove all applied status filters
   */
  clearStatusFilters() {
    this.statusFilters.clear();
    this.filter();
  }

  /**
   * Remove all applied length filters
   */
  clearLengthFilters() {
    this.lengthFilters.clear();
    this.filter();
  }

  /**
   * Remove all active status filters and collection filters
   *
   * @memberof FilterSearchComponent
   */
  clearAllFilters() {
    this.statusFilters.clear();
    this.lengthFilters.clear();
    this.selectedLastUpdatedSortType = undefined;
    this.selectedRatingSortType = undefined;
    this.clearAll.emit();
  }

  /**
   * Returns the correct icon for the given Learning Object status
   *
   * @param {string} status the status for which to return an icon
   * @returns {string}
   * @memberof FilterSearchComponent
   */
  getStatusIcon(status: string): string {
    switch (status) {
      case 'unreleased':
        return 'far fa-eye-slash';
      case 'waiting':
        return 'far fa-hourglass';
      case 'review':
        return 'far fa-sync';
      case 'proofing':
        return 'far fa-shield';
      case 'released':
        return 'far fa-eye';
      case 'rejected':
        return 'far fa-ban';
      case 'accepted_minor':
        return 'fas fa-check-double';
      case 'accepted_major':
        return 'fas fa-check';
    }
  }

  /**
   * Checks if a given date is today
   *
   * @param date The date to check
   * @returns A boolean, true if today, false otherwise
   */
  isToday(date: Date): boolean {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }
}
