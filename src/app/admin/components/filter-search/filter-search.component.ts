import {
  Component,
  ElementRef,
  EventEmitter,
  OnInit,
  Input,
  Output,
  ViewChild,
} from '@angular/core';

import {
  CollectionService,
  Collection,
} from 'app/core/collection-module/collections.service';
import { AuthService } from 'app/core/auth-module/auth.service';
import { Subject } from 'rxjs';
import { LearningObject } from '@entity';
import { ToastrOvenService } from 'app/shared/modules/toaster/notification.service';
import { Topic } from '@entity';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { TopicsService } from 'app/core/learning-object-module/topics/topics.service';

@Component({
  selector: 'clark-admin-filter-search',
  templateUrl: './filter-search.component.html',
  styleUrls: ['./filter-search.component.scss'],
})
export class FilterSearchComponent implements OnInit {
  collections: Collection[] = [];
  topics: Topic[] = [];
  isCollectionRestricted = false;
  filtersModified$: Subject<void> = new Subject();
  filters: Set<string> = new Set();
  filterTopics: Set<string> = new Set();
  statuses = Object.values(LearningObject.Status);

  private _selectedCollection: Collection;

  private _selectedTopic: Topic;

  @Input() adminOrEditor: boolean;
  @Input() showStatus: boolean;
  @Output() collectionFilter = new EventEmitter<string>();
  @Output() filterQuery = new EventEmitter<{
    status: string[],
    topic: string[],
    collection: string,
  }>();
  @Output() relevancyCheck = new EventEmitter<{ start: string; end: string }>();
  @Output() dateSearchFilter = new EventEmitter<{
    start: string;
    end: string;
  }>();
  @Output() clearAll = new EventEmitter<void>();
  @ViewChild('searchInput') searchInput: ElementRef;

  filterMenuDown = false;
  collectionMenuDown = false;
  topicMenuDown = false;

  relevancyStart: Date;
  relevancyEnd: Date;
  dateSearchStart: Date;
  dateSearchEnd: Date;
  relevancyMenuDown: boolean;
  dateSearchMenuDown: boolean;

  constructor(
    private collectionService: CollectionService,
    private topicsService: TopicsService,
    private authService: AuthService,
    private toaster: ToastrOvenService,
    private route: ActivatedRoute,
  ) {}

  async ngOnInit() {
    await this.getCollections();
    this.findUserRestrictions();
    this.getTopics();

    // add the 'all' option into the list of statuses
    this.statuses.splice(0, 0);

    this.statuses = this.statuses.filter(
      (s) => !['unreleased'].includes(s.toLowerCase()),
    );
    this.relevancyStart = new Date();

    //check for params in the query and add them to the filter dropdown bars
    const qParams = this.route.parent.snapshot.queryParamMap;

    const queryTopics = qParams.getAll('topics');
    const queryStatuses = qParams.getAll('statuses');

    //if there are topics in the query, toggle them in the filter dropdown
    if (queryTopics) {
      const topics = [];
      for (const topic of queryTopics) {
        topics.push({ name: '', _id: topic });
      }

      this.toggleTopicFilter(topics);
    }

    // if there are statuses in the query add them to the filter dropdowns
    if (queryStatuses) {
      this.toggleStatusFilter(queryStatuses);
    }

    // Set the collection if it exists, otherwise default back to the params.
    if (qParams.get('collection')) {
      this.toggleCollectionFilter(qParams.get('collection'));
    } else {
      this.toggleCollectionFilter(this.route.parent.snapshot.params.collection);
    }
  }

  /**
   * Fetches the collections from the CollectionService and formats them for use in the context menu.
   */
  private async getCollections(): Promise<void> {
    await this.collectionService
      .getCollections()
      .then((collections) => {
        this.collections = Array.from(collections);
        this.collections.push({ abvName: 'all', name: 'All', hasLogo: false });

        this.collections.sort((a, b) => {
          if (a.name < b.name) {
            return -1;
          }
          if (a.name > b.name) {
            return 1;
          }
          return 0;
        });
      })
      .catch((error) => {
        this.toaster.error('Error!', error);
      });
  }

  private getTopics(): void {
    this.topicsService.getTopics().then((topics) => {
      this.topics = topics;
      this.topics = [].concat(
        [{ _id: 'all', name: 'All' }],
        Array.from(topics),
      );
    });
  }

  /**
   * Checks for user's authorization
   */
  private findUserRestrictions() {
    this.authService.user.accessGroups.forEach((group: string) => {
      if (group.includes('@')) {
        this.isCollectionRestricted = true;
      }
    });
  }

  /**
   * Set's the selected collection property to the full Collection object represented by the abbreviated name
   *
   * @param { string } abvName abbreviated name of the collection
   */
  setSelectedCollection(abvName: string) {
    this._selectedCollection = this.collections.filter(
      (x) => x.abvName === abvName,
    )[0];
  }

  /**
   * Return the currently selected collection
   *
   * @readonly
   * @type {Collection}
   * @memberof FilterSearchComponent
   */
  get selectedCollection(): Collection {
    return this._selectedCollection;
  }

  get selectedTopic(): Topic {
    return this._selectedTopic;
  }

  /**
   * Hide or show the filter dropdown menu
   *
   * @param {boolean} [value] true if menu is open, false otherwise
   */
  toggleFilterMenu(value?: boolean) {
    this.filterMenuDown = value;
  }

  /**
   * Hide or show the collection filter dropdown menu
   *
   * @param {boolean} [value] true if menu is open, false otherwise
   */
  toggleCollectionMenu(value?: boolean) {
    this.collectionMenuDown = value;
  }

  /**
   * Hide or show the topic dropdown menu
   *
   * @param {boolean} [value] true if menu is open, false otherwise
   */
  toggleTopicMenu(value?: boolean) {
    this.topicMenuDown = value;
  }

  /**
   * Toggles the relevancy modal menu
   *
   * @param value
   */
  toggleRelevancyMenu(value?: boolean) {
    this.relevancyMenuDown = value;
  }

  /**
   * Toggles the date select modal menu
   *
   * @param value
   */
  toggleDateSearchMenu(value?: boolean) {
    this.dateSearchMenuDown = value;
  }

  /**
   * Sets the relevancy date filters
   */
  setDates() {
    let start = new Date().getTime().toString();
    let end;
    if (this.relevancyStart !== undefined) {
      start = this.relevancyStart.getTime().toString();
    }
    if (this.relevancyEnd !== undefined) {
      end = this.relevancyEnd.getTime().toString();
    }
    this.relevancyCheck.emit({ start, end });
    this.toggleRelevancyMenu(false);
  }

  /**
   * Sets the date search filters
   */
  setDateSearch() {
    this.dateSearchFilter.emit({
      start: this.dateSearchStart ? this.dateSearchStart.toISOString() : '',
      end: this.dateSearchEnd ? this.dateSearchEnd.toISOString() : '',
    });
    this.toggleDateSearchMenu(false);
  }

  /**
   * Clears the relevancy date filters
   */
  clearDates() {
    this.relevancyStart = new Date();
    this.relevancyEnd = undefined;
    this.relevancyCheck.emit({ start: undefined, end: undefined });
    this.toggleRelevancyMenu(false);
  }

  /**
   * Clears the date search filters
   */
  clearDateSearch() {
    this.dateSearchStart = undefined;
    this.dateSearchEnd = undefined;
    this.dateSearchFilter.emit({ start: undefined, end: undefined });
    this.toggleDateSearchMenu(false);
  }

  /**
   * Add or remove filter from filters list
   *
   * @param filter {string} the filter to be toggled
   */
  toggleStatusFilter(filters: string[]) {
    for (const filter of filters) {
      if (filter.toLowerCase() === 'all') {
        this.clearStatusFilters();
        this.toggleFilterMenu(undefined);
        return;
      }

      if (!this.filters.has(filter)) {
        this.filters.add(filter);
      } else {
        this.filters.delete(filter);
      }
    }
    this.filter();
  }

  /**
   * Add or remove filter from filters list
   *
   * @param filter {string} the filter to be toggled
   */
  toggleCollectionFilter(filter: string) {
    if (filter.toLowerCase() === 'all') {
      this.clearCollectionFilters();
      this.toggleCollectionMenu(undefined);
      return;
    } else if (
      this.selectedCollection &&
      filter === this.selectedCollection.abvName
    ) {
      this.clearCollectionFilters();
    } else {
      this.setSelectedCollection(filter);
    }
    this.filter();
  }

  toggleTopicFilter(filters?: { name?: string; _id: string }[]) {
    for (const filter of filters) {
      if (filter.name.toLowerCase() === 'all') {
        this.clearTopicFilters();
        this.toggleTopicMenu(undefined);
        return;
      }

      if (this.filterTopics.has(filter._id)) {
        this.filterTopics.delete(filter._id);
      } else {
        this.filterTopics.add(filter._id);
      }
    }
    this.filter();
  }

  filter() {
    // Emit the selected filters
    const filters = {
       status:  Array.from(this.filters || []),
       topic: Array.from(this.filterTopics || []),
       collection: this.selectedCollection ? this.selectedCollection.abvName : '',
      };
      this.filterQuery.emit(filters);
   }

  /**
   * Remove all applied status filters
   */
  clearStatusFilters() {
    this.filters.clear();
    this.filter();
  }

  /**
   * Remove any applied collection filters
   *
   * @memberof FilterSearchComponent
   */
  clearCollectionFilters() {
    this.setSelectedCollection(undefined);
    this.filter();
  }

  clearTopicFilters() {
    this.filterTopics.clear();
    this.filter();
  }

  /**
   * Removes the Relevancy check date
   */
  clearRelevancyDateFilters() {
    this.relevancyStart = undefined;
    this.relevancyEnd = undefined;
    this.relevancyCheck.emit(undefined);
  }

  /**
   * Remove all active status filters and collection filters
   *
   * @memberof FilterSearchComponent
   */
  clearAllFilters() {
    this.setSelectedCollection(undefined);
    this.clearRelevancyDateFilters();
    this.filters.clear();
    this.filterTopics.clear();
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

  /**
   * Gets wether a filter has been selected
   */
  get filterSelected() {
    return this.relevancyEnd || !this.isToday(this.relevancyStart);
  }
}
