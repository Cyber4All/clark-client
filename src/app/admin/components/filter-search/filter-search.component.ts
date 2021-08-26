import {
  Component,
  ElementRef,
  EventEmitter,
  OnInit,
  Input,
  Output,
  ViewChild
} from '@angular/core';


import { CollectionService, Collection } from 'app/core/collection.service';
import { AuthService } from 'app/core/auth.service';
import { Subject } from 'rxjs';
import { LearningObject } from '@entity';
import { ToastrOvenService } from 'app/shared/modules/toaster/notification.service';
import { Topic } from '@entity';
import { RelevancyService } from 'app/core/relevancy.service';

@Component({
  selector: 'clark-admin-filter-search',
  templateUrl: './filter-search.component.html',
  styleUrls: ['./filter-search.component.scss']
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
  @Output() statusFilter = new EventEmitter<any[]>();
  @Output() collectionFilter = new EventEmitter<string>();
  @Output() topicFilter = new EventEmitter<any[]>();
  @Output() relevancyCheck = new EventEmitter<{start: string, end: string}>();
  @Output() clearAll = new EventEmitter<void>();
  @ViewChild('searchInput') searchInput: ElementRef;

  filterMenuDown = false;
  collectionMenuDown = false;
  topicMenuDown = false;

  relevancyStart: Date;
  relevancyEnd: Date;
  relevancyMenuDown: boolean;


  constructor(
    private collectionService: CollectionService,
    private relevancyService: RelevancyService,
    private authService: AuthService,
    private toaster: ToastrOvenService
  ) {}

  ngOnInit() {
    this.getCollections();
    this.findUserRestrictions();
    this.getTopics();

    // add the 'all' option into the list of statuses
    this.statuses.splice(0, 0);

    this.statuses = this.statuses.filter(
      s => !['rejected', 'unreleased'].includes(s.toLowerCase())
    );
    this.relevancyStart = new Date();
  }

  /**
   * Fetches the collections from the CollectionService and formats them for use in the context menu.
   */
  private getCollections(): void {
    this.collectionService
      .getCollections()
      .then(collections => {
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
      .catch(error => {
        this.toaster.error('Error!', error);
      });
  }

  private getTopics(): void {
    this.relevancyService
      .getTopics()
      .then(topics => {
        this.topics = Array.from(topics);
        this.topics.push({ _id: 'all', name: 'all' });
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
   * @param { string } abvName abbreviated name of the collection
   */
  setSelectedCollection(abvName: string) {
    this._selectedCollection = this.collections.filter(
      x => x.abvName === abvName
    )[0];
  }

  setSelectedTopic(name: string) {
    this._selectedTopic = this.topics.filter(
      x => x.name === name
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
   * @param {boolean} [value] true if menu is open, false otherwise
   */
  toggleFilterMenu (value?: boolean) {
    this.filterMenuDown = value;
  }

  /**
   * Hide or show the collection filter dropdown menu
   * @param {boolean} [value] true if menu is open, false otherwise
   */
  toggleCollectionMenu (value?: boolean) {
    this.collectionMenuDown = value;
  }

  /**
   * Hide or show the topic dropdown menu
   * @param {boolean} [value] true if menu is open, false otherwise
   */
  toggleTopicMenu (value?: boolean) {
    this.topicMenuDown = value;
  }

  /**
   * Toggles the relevancy modal menu
   * @param value
   */
  toggleRelevancyMenu (value?: boolean) {
    this.relevancyMenuDown = value;
  }

  setDates() {
    let start = new Date().getTime().toString();
    let end;
    if (this.relevancyStart !== undefined) {
      start = this.relevancyStart.getTime().toString();
    }
    if (this.relevancyEnd !== undefined) {
      end = this.relevancyEnd.getTime().toString();
    }
    this.relevancyCheck.emit({start, end});
    this.toggleRelevancyMenu(false);
  }

  /**
   * Add or remove filter from filters list
   * @param filter {string} the filter to be toggled
   */
  toggleStatusFilter(filter: string) {
    if (filter.toLowerCase() === 'all') {
      this.clearStatusFilters();
      this.toggleFilterMenu(undefined);
      return;
    }

    if (this.filters.has(filter)) {
      this.filters.delete(filter);
    } else {
      this.filters.add(filter);
    }
    this.statusFilter.emit(Array.from(this.filters));
  }

  /**
   * Add or remove filter from filters list
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
      this.collectionFilter.emit(filter);
    }
  }

  toggleTopicFilter(filter: string) {
    if (filter.toLowerCase() === 'all') {
      this.clearTopicFilters();
      this.toggleTopicMenu(undefined);
      return;
    }
    if (this.filterTopics.has(filter)) {
      this.filterTopics.delete(filter);
    } else {
      this.filterTopics.add(filter);
    }
    this.topicFilter.emit(Array.from(this.filterTopics));

  }

  /**
   * Remove all applied status filters
   */
  clearStatusFilters() {
    this.filters.clear();
    this.statusFilter.emit([]);
  }

  /**
   * Remove any applied collection filters
   *
   * @memberof FilterSearchComponent
   */
  clearCollectionFilters() {
    this.setSelectedCollection(undefined);
    this.collectionFilter.emit(undefined);
  }

  clearTopicFilters() {
    this.filterTopics.clear();
    this.topicFilter.emit(undefined);
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
    }
  }
}
