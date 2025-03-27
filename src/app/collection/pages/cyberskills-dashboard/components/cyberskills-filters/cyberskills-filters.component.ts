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
import { FilterQuery, OrderBy, SortType } from '../../../../../interfaces/query';

@Component({
  selector: 'clark-cyberskills-filters',
  templateUrl: './cyberskills-filters.component.html',
  styleUrls: [
    '../../../../../admin/components/filter-search/filter-search.component.scss',
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

  // Mobile Menu States
  mobileStatusMenuActive: boolean;
  mobileLengthMenuActive: boolean;
  mobileSortMenuActive: boolean;

  // Desktop Menu States
  desktopStatusMenuActive: boolean;
  desktopLengthMenuActive: boolean;
  desktopSortMenuActive: boolean;

  showOptions = false;
  filtersApplied = false;

  @Output() filterQuery = new EventEmitter<FilterQuery>();
  @Output() clearAll = new EventEmitter<void>();
  @ViewChild('searchInput') searchInput: ElementRef;

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
    if (queryStatuses && queryStatuses.length > 0) {
      this.toggleStatusFilter(queryStatuses);
    }

    // Initialize mobile booleans
    this.mobileStatusMenuActive = false;
    this.mobileLengthMenuActive = false;
    this.mobileSortMenuActive = false;

    // Initialize desktop booleans
    this.desktopStatusMenuActive = false;
    this.desktopLengthMenuActive = false;
    this.desktopSortMenuActive = false;
  }

  /**
   * Toggles the mobile "Filters" menu.
   * If opening, closes all sub-menus first.
   */
  toggleFiltersMenu() {
    this.showOptions = !this.showOptions;
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
    if (!this.elRef.nativeElement.contains(event.target)) {
      this.closeAllMenus();
      this.showOptions = false; // also hide the entire mobile filter dropdown
    }
  }

  /**
   * Closes all MOBILE sub-menus.
   */
  private closeAllMenus() {
    this.mobileStatusMenuActive = false;
    this.mobileLengthMenuActive = false;
    this.mobileSortMenuActive = false;
  }

  /**
   * Hide or show the status filter dropdown menu in mobile view
   */
  toggleMobileStatusMenu() {
    if (this.mobileStatusMenuActive) {
      this.mobileStatusMenuActive = false;
    } else {
      this.closeAllMenus();
      this.mobileStatusMenuActive = true;
    }
  }

  /**
   * Hide or show the length filter dropdown menu in mobile view
   */
  toggleMobileLengthMenu() {
    if (this.mobileLengthMenuActive) {
      this.mobileLengthMenuActive = false;
    } else {
      this.closeAllMenus();
      this.mobileLengthMenuActive = true;
    }
  }


  /**
   * Hide or show the rating filter dropdown menu in mobile view
   */
  toggleMobileSortMenu() {
    if (this.mobileSortMenuActive) {
      this.mobileSortMenuActive = false;
    } else {
      this.closeAllMenus();
      this.mobileSortMenuActive = true;
    }
  }

  /**
   * Hide or show the status filter dropdown menu in desktop view
   */
  toggleDesktopStatusMenu(value: boolean) {
    this.desktopStatusMenuActive = value;
  }

  /**
   * Hide or show the length filter dropdown menu in desktop view
   */
  toggleDesktopLengthMenu(value: boolean) {
    this.desktopLengthMenuActive = value;
  }

  /**
   * Hide or show the rating filter dropdown menu in desktop view
   */
  toggleDesktopSortMenu(value: boolean) {
    this.desktopSortMenuActive = value;
  }

  /**
   * Toggle one or more status filters.
   * If "all" is clicked, clear them all and close the menu.
   */
  toggleStatusFilter(filters: string[]) {
    for (const filter of filters) {
      if (filter.toLowerCase() === 'all') {
        this.clearStatusFilters();
        // Also close desktop menu if open
        this.desktopStatusMenuActive = false;
        // Also close mobile menu if open
        this.mobileStatusMenuActive = false;
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
   * Set the sort value based on the selected order type.
   * @param orderBy the field to sort by (Date or Rating)
   * @param sort the sort direction (ascending or descending)
   */
  setSort(orderBy: OrderBy, sort: SortType) {
    this.selectedOrderBy = orderBy;

    if (orderBy === OrderBy.Date) {
      this.selectedLastUpdatedSortType = sort;
      this.selectedRatingSortType = undefined;
    } else if (orderBy === OrderBy.Rating) {
      this.selectedRatingSortType = sort;
      this.selectedLastUpdatedSortType = undefined;
    }

    this.filter();
  }


  /**
   * Builds the FilterQuery and emits it to the parent
   */
  filter() {
    const filters: FilterQuery = {
      status: Array.from(this.statusFilters),
      length: Array.from(this.lengthFilters),
      orderBy: this.selectedOrderBy,
      sortType: this.selectedLastUpdatedSortType || this.selectedRatingSortType,
    };
    this.filtersApplied = true;
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
   */
  clearAllFilters() {
    this.statusFilters.clear();
    this.lengthFilters.clear();
    this.selectedLastUpdatedSortType = undefined;
    this.selectedRatingSortType = undefined;

    // Close desktop menus
    this.desktopStatusMenuActive = false;
    this.desktopLengthMenuActive = false;
    this.desktopSortMenuActive = false;

    // Close mobile menus
    this.mobileStatusMenuActive = false;
    this.mobileLengthMenuActive = false;
    this.mobileSortMenuActive = false;

    this.showOptions = false;
    this.filtersApplied = false;
    this.filter();
    this.clearAll.emit();
  }

  /**
   * Returns the correct icon for the given Learning Object status
   *
   * @param {string} status the status for which to return an icon
   * @returns {string}
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
