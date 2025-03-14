import {
  Component,
  ElementRef,
  EventEmitter,
  OnInit,
  Input,
  Output,
  ViewChild,
  ChangeDetectorRef,
} from '@angular/core';

import { Subject } from 'rxjs';
import { LearningObject } from '@entity';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { TopicsService } from '../../../../core/learning-object-module/topics/topics.service';
import { FilterQuery } from '../../../../interfaces/query';


@Component({
  selector: 'clark-cyberskills2work-filters',
  templateUrl: './cyberskills2work-filters.component.html',
  styleUrls: ['../../../../admin/components/filter-search/filter-search.component.scss']
})
export class Cyberskills2WorkFiltersComponent implements OnInit {
  filtersModified$: Subject<void> = new Subject();
  statusFilters: Set<string> = new Set();
  lengthFilters: Set<string> = new Set();
  statuses = Object.values(LearningObject.Status);
  lengths = Object.values(LearningObject.Length);

  @Input() adminOrEditor: boolean;
  @Input() showStatus: boolean;
  // Output a new query object to trigger a new LO query.
  @Output() filterQuery = new EventEmitter<FilterQuery>();
  @Output() clearAll = new EventEmitter<void>();
  @ViewChild('searchInput') searchInput: ElementRef;

  statusMenuActive: boolean;
  lengthMenuActive: boolean;

  constructor(
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    // add the 'all' option into the list of statuses
    this.statuses.splice(0, 0);

    this.statuses = this.statuses.filter(
      (s) => !['rejected', 'unreleased'].includes(s.toLowerCase()),
    );
    this.statusMenuActive = false;

    //check for params in the query and add them to the filter dropdown bars
    const qParams = this.route.parent?.snapshot.queryParamMap;
    const queryStatuses = qParams?.getAll('statuses');

    // if there are statuses in the query add them to the filter dropdowns
    if (queryStatuses) {
      this.toggleStatusFilter(queryStatuses);
    }
  }

  /**
   * Hide or show the status filter dropdown menu
   */
  toggleStatusMenu(value: boolean) {
    this.statusMenuActive = value;
  }

  /**
   * Hide or show the length filter dropdown menu
   */
  toggleLengthMenu(value: boolean) {
    this.lengthMenuActive = value;
  }

  /**
   * Add or remove filter from status filter list
   *
   * @param {string} filter the filter to be toggled
   */
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


  filter() {
    // Emit the selected filters
    const filters = {
       status: Array.from(this.statusFilters || []),
       length: Array.from(this.lengthFilters || []),
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
