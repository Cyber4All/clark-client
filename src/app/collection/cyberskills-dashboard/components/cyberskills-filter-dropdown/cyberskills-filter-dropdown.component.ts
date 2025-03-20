import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FilterQuery, OrderBy, SortType } from '../../../../interfaces/query';
import { LearningObject } from '@entity';

@Component({
  selector: 'clark-cyberskills-filter-dropdown',
  templateUrl: './cyberskills-filter-dropdown.component.html',
  styleUrls: ['./cyberskills-filter-dropdown.component.scss'],
})
export class CyberskillsFilterDropdownComponent implements OnInit {
  // Sets for filters
  statusFilters: Set<string> = new Set();
  lengthFilters: Set<string> = new Set();

  // Sorting selections
  selectedOrderBy: OrderBy;
  selectedLastUpdatedSortType?: SortType;
  selectedRatingSortType?: SortType;

  // Lists for filter options
  statuses = Object.values(LearningObject.Status);
  lengths = Object.values(LearningObject.Length);
  sortValues = Object.values(SortType);

  // Mobile dropdown toggle
  showOptions = false;

  // Context menu state booleans
  statusMenuActive: boolean;
  lengthMenuActive: boolean;
  sortDateMenuActive: boolean;
  sortRatingMenuActive: boolean;

  // Output filtering events
  @Output() filterQuery = new EventEmitter<FilterQuery>();
  @Output() clearAll = new EventEmitter<void>();

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    // Remove unwanted statuses
    this.statuses = this.statuses.filter(
      (s) => !['rejected', 'unreleased'].includes(s.toLowerCase()),
    );
    this.statusMenuActive = false;
    this.lengthMenuActive = false;
    this.sortDateMenuActive = false;
    this.sortRatingMenuActive = false;
  }

  // Toggle the entire mobile dropdown
  toggleOptionsMenu() {
    this.showOptions = !this.showOptions;
  }

  // Toggle context menus for each filter type
  toggleStatusMenu(value: boolean) {
    this.statusMenuActive = value;
  }

  toggleLengthMenu(value: boolean) {
    this.lengthMenuActive = value;
  }

  toggleSortDateMenu(value: boolean) {
    this.sortDateMenuActive = value;
  }

  toggleSortRatingMenu(value: boolean) {
    this.sortRatingMenuActive = value;
  }

  // Filter toggling functions
  toggleStatusFilter(filters: string[]) {
    for (const filter of filters) {
      if (filter.toLowerCase() === 'all') {
        this.clearStatusFilters();
        this.toggleStatusMenu(false);
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

  setLastUpdatedSort(sort: SortType) {
    this.selectedOrderBy = OrderBy.Date;
    this.selectedLastUpdatedSortType = sort;
    this.selectedRatingSortType = undefined;
    this.filter();
  }

  setRatingSort(sort: SortType) {
    this.selectedOrderBy = OrderBy.Rating;
    this.selectedRatingSortType = sort;
    this.selectedLastUpdatedSortType = undefined;
    this.filter();
  }

  // Emit the filter query object
  filter() {
    const filters: FilterQuery = {
      status: Array.from(this.statusFilters),
      length: Array.from(this.lengthFilters),
      orderBy: this.selectedOrderBy,
      sortType: this.selectedLastUpdatedSortType || this.selectedRatingSortType,
    };
    this.filterQuery.emit(filters);
  }

  // Clear functions
  clearStatusFilters() {
    this.statusFilters.clear();
    this.filter();
  }

  clearLengthFilters() {
    this.lengthFilters.clear();
    this.filter();
  }

  clearAllFilters() {
    this.statusFilters.clear();
    this.lengthFilters.clear();
    this.selectedLastUpdatedSortType = undefined;
    this.selectedRatingSortType = undefined;
    this.clearAll.emit();
  }

  // Returns the proper icon for a given status
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
      default:
        return '';
    }
  }
}
