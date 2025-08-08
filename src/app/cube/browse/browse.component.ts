import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  HostListener,
  OnDestroy,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LearningObject } from '@entity';
import { NavbarService } from 'app/core/client-module/navbar.service';
import { CollectionService } from 'app/core/collection-module/collections.service';
import { SearchService } from 'app/core/learning-object-module/search/search.service';
import { Observable, Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { TopicsService } from '../../core/learning-object-module/topics/topics.service';
import { OrderBy, Query, SortType } from '../../interfaces/query';
import { COPY } from './browse.copy';

@Component({
  selector: 'cube-browse',
  templateUrl: './browse.component.html',
  styleUrls: ['./browse.component.scss'],
})
export class BrowseComponent implements AfterViewInit, OnDestroy {
  copy = COPY;
  learningObjects: LearningObject[];
  totalLearningObjects = 0;
  outcomeSources: any[];

  query: Query = {
    text: '',
    currPage: 1,
    limit: 30,
    length: [],
    noGuidelines: '',
    guidelines: [],
    level: [],
    standardOutcomes: [],
    orderBy: OrderBy.Date,
    sortType: -1,
    collection: '',
    topics: [],
    fileTypes: [],
    status: [LearningObject.Status.RELEASED],
  };

  tooltipText = {
    nanomodule: 'a Learning Object up to 1 hour in length',
    micromodule: 'a Learning Object between 1 and 4 hours in length',
    module: 'a Learning Object between 4 and 10 hours in length',
    unit: 'a Learning Object over 10 hours in length',
    course: 'a Learning Object 15 weeks in length',
  };

  loading = true;
  mappingsPopup = false;

  pageCount: number;
  filtering = false;
  filters: any = {};

  searchDelaySubject: any;

  filterInput: Observable<string>;
  filterClearSubject$: Subject<void> = new Subject<void>();

  filtersDownMobile = false;
  windowWidth: number;

  unsubscribe: Subject<void> = new Subject();

  shouldResetPage = false;

  sortMenuDown: boolean;
  sortMenuOpen = false;
  showClearSort: boolean;
  sortText = 'Newest';

  // New properties for modern design
  searchQuery = '';
  viewMode: 'grid' | 'list' = 'grid';
  showAdvancedFilters = false;
  currentSort = 'newest';

  // Quick filter options
  quickLengthFilters = [
    { name: '< 1 Hour', value: 'nanomodule', icon: 'fas fa-clock' },
    { name: '1-4 Hours', value: 'micromodule', icon: 'fas fa-hourglass-half' },
    { name: '4-10 Hours', value: 'module', icon: 'fas fa-hourglass' },
    { name: '10+ Hours', value: 'unit', icon: 'fas fa-hourglass-end' }
  ];

  quickLevelFilters = [
    { name: 'Beginner', value: 'undergraduate' },
    { name: 'Intermediate', value: 'graduate' },
    { name: 'Advanced', value: 'postgraduate' }
  ];

  collections: any[] = [];
  topTopics: any[] = [];

  sortOptions = [
    { label: 'Newest First', value: 'newest', icon: 'fas fa-calendar-plus' },
    { label: 'Most Downloaded', value: 'downloads', icon: 'fas fa-download' },
    { label: 'Highest Rated', value: 'rating', icon: 'fas fa-star' },
    { label: 'Alphabetical', value: 'alphabetical', icon: 'fas fa-sort-alpha-down' },
    { label: 'Shortest First', value: 'duration', icon: 'fas fa-clock' }
  ];

  @HostListener('window:resize', ['$event'])
  handelResize(event) {
    this.windowWidth = event.target.innerWidth;
    this.cd.detectChanges();
  }

  constructor(
    private searchLearningObjectService: SearchService,
    private route: ActivatedRoute,
    private router: Router,
    private cd: ChangeDetectorRef,
    private navService: NavbarService,
    private searchService: SearchService,
    private collectionService: CollectionService,
    private topicsService: TopicsService,
  ) {
    this.windowWidth = window.innerWidth;
    this.cd.detach();
  }

  ngAfterViewInit() {
    // Initialize modern browse page
    this.initializeModernBrowse();

    // used by the performSearch function (when delay is true) to add a debounce effect
    this.searchDelaySubject = new Subject<void>()
      .pipe(debounceTime(650), takeUntil(this.unsubscribe))
      .subscribe(() => {
        this.performSearch();
      });

    // whenever the queryParams change, map them to the query object and perform the search
    this.route.queryParams
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(async (params) => {
        // makes query based and sends request to fetch learning objects
        this.makeQuery(params);
        // with a text search and no sortType is provided, no sort is applied, otherwise apply the default sort
        this.sortText = params.text && !params.sortType ? '' : this.sortText;
        this.searchQuery = this.query.text || '';
        this.fetchLearningObjects(this.query);
      });
  }

  private async initializeModernBrowse() {
    // Load collections and topics dynamically
    await this.loadCollections();
    await this.loadTopics();
  }

  get isMobile(): boolean {
    return this.windowWidth < 750;
  }

  // creates an array of numbers where each represents a page that can be navigated to.
  // defaults to a grand total of 5 pages, either your page in the middle and two on each side,
  // or (if you're say on page 2) 1 page on the left and 3 pages on the right. (1, 2, 3, 4, 5)
  get pages() {
    const total = 5;
    const cursor = +this.query.currPage;
    let count = 1;
    let upCount = 1;
    let downCount = 1;
    const arr = [cursor];

    if (this.learningObjects.length) {
      while (count < Math.min(total, this.pageCount)) {
        if (cursor + upCount <= this.pageCount) {
          arr.push(cursor + upCount++);
          count++;
        }

        if (cursor - downCount > 0) {
          arr.unshift(cursor - downCount++);
          count++;
        }
      }
    } else {
      return [];
    }

    return arr;
  }

  // navigate to previous page
  prevPage() {
    const page = +this.query.currPage - 1;
    if (page > 0) {
      this.query.currPage = page;
      this.shouldResetPage = false;
      this.performSearch();
    }
  }

  // navigate to next page
  nextPage() {
    const page = +this.query.currPage + 1;
    if (page <= this.pageCount) {
      this.query.currPage = page;
      this.shouldResetPage = false;
      this.performSearch();
    }
  }

  // navigate to a numbered page
  goToPage(page) {
    if (page > 0 && page <= this.pageCount) {
      this.query.currPage = +page;
      this.shouldResetPage = false;
      this.performSearch();
    }
  }

  clearSearch() {
    this.navService.query.next(true);
    this.query.text = '';
    this.query.standardOutcomes = [];
    this.query.currPage = 1;
    this.query.sortType = -1;
    this.query.orderBy = OrderBy.Date;
    this.router.navigate(['browse'], { queryParams: {} });
  }

  get sortString() {
    return this.query.orderBy
      ? this.query.orderBy.replace(/_/g, '') +
      ' (' +
      (this.query.sortType > 0 ? 'Asc' : 'Desc') +
      ')'
      : '';
  }

  toggleFilters() {
    this.filtersDownMobile = !this.filtersDownMobile;
    this.cd.detectChanges();
  }

  closeFilters() {
    this.toggleFilters();
  }

  /**
   * This is used only on modal layouts, injects the tempFilter storage into the query object and sends it
   */
  applyFilters() {
    this.performSearch();
  }

  /**
   * Registers the filters from the filter menu
   *
   * @param filters The filters emitted from the filter component
   */
  filter(filters: any) {
    // Set filters and sets the ones that were removed so the performSearch function can
    // correctly interface with sort and search
    this.filters = filters;
    this.filters.removed = [];
    [
      'collection',
      'length',
      'topics',
      'tags',
      'fileTypes',
      'level',
      'guidelines',
      'standardOutcomes',
      'noGuidelines',
    ].forEach((category) => {
      if (!this.filters[category]) {
        this.filters.removed.push(category);
      }
    });

    if (!this.filtersDownMobile) {
      this.performSearch(true);
    }
  }

  clearAllFilters(sendFilters: boolean = true) {
    this.filterClearSubject$.next();

    if (sendFilters) {
      this.performSearch();
    }
  }

  /**
   * Executes a search by reading through the query object and mapping it to query parameters and then re-navigating to the component
   *
   * @param delay if true, triggers a debounced subject, which will call performSearch again with no delay
   */
  performSearch(delay: boolean = false) {
    if (delay) {
      this.searchDelaySubject.next();
    } else {
      if (this.filters && Object.keys(this.filters).length > 0) {
        // Remove the removed filter categories from the query object
        (this.filters.removed as string[]).forEach(
          (category) => delete this.query[category],
        );
        delete this.filters.removed;

        // Append the filters without the removed option (not used in search) and resets filters
        this.query = { ...this.query, ...this.filters };
        this.filters = {};
      }

      // if we're adding a filter that isn't a page change, reset the currPage in query to 1
      if (this.shouldResetPage) {
        this.query.currPage = 1;
      }
      this.shouldResetPage = true;

      this.router.navigate(['browse'], {
        queryParams: this.removeObjFalsy(this.query),
      });
    }
  }


  toggleSort(val) {
    if (val !== null) {
      this.showClearSort = true;
      if (val === 'da') {
        this.sortText = 'Oldest';
        this.query.orderBy = OrderBy.Date;
        this.query.sortType = SortType.Ascending;
      } else if (val === 'dd') {
        this.sortText = 'Newest';
        this.query.orderBy = OrderBy.Date;
        this.query.sortType = SortType.Descending;
      } else if (val === 'na') {
        this.sortText = 'Alphabetical';
        this.query.orderBy = OrderBy.Name;
        this.query.sortType = SortType.Ascending;
      } else if (val === 'md') {
        this.sortText = 'Most Downloaded';
        this.query.orderBy = 'downloads' as OrderBy;
        this.query.sortType = SortType.Descending;
      } else if (val === 'hr') {
        this.sortText = 'Highest Rated';
        this.query.orderBy = 'rating' as OrderBy;
        this.query.sortType = SortType.Descending;
      }

      this.performSearch();
    }
  }

  clearSort(event) {
    this.showClearSort = false;
    event.stopPropagation();
    delete this.query.orderBy;
    delete this.query.sortType;
    this.sortText = '';
    this.performSearch();
  }

  /**
   * Takes an object of parameters and attempts to map them to the query objcet
   *
   * @param {*} params the object returned from subscribing to the routers queryParams observable
   */
  makeQuery(params: Record<string, string>) {
    const paramKeys = Object.keys(params);

    // no sort applied for text search
    if (paramKeys.includes('text')) {
      this.query.orderBy = undefined;
      this.query.sortType = undefined;
    }

    // iterate params object
    for (let i = 0, l = paramKeys.length; i < l; i++) {
      const key = paramKeys[i];
      if (Object.keys(this.query).includes(key)) {
        const val = params[key];
        // this parameter is a query param, add it to the query object
        if (key === 'currPage') {
          this.query.currPage = parseInt(val, 10);
        } else {
          this.query[key] = val;
        }
      }
    }
  }

  async fetchLearningObjects(query: Query) {
    this.loading = true;
    this.learningObjects = [];
    // Trim leading and trailing whitespace
    query.text = query.text ? query.text.trim() : '';
    try {
      const { learningObjects, total } =
        await this.searchLearningObjectService.getLearningObjects(query);
      this.learningObjects = learningObjects;
      this.totalLearningObjects = total;
      this.pageCount = Math.ceil(total / +this.query.limit);
      this.loading = false;
      this.cd.detectChanges();
    } catch (e) {
      console.log(`Error: ${e}`);
    }
  }

  /**
   * Deep copy and strip all falsy values (and empty arrays) from an object
   */
  private removeObjFalsy(obj: any): any {
    const keys = Object.keys(obj);
    // deep copy object to prevent direct modification of passed object
    const output = Object.assign({}, obj);

    for (let i = 0, l = keys.length; i < l; i++) {
      if (
        !output[keys[i]] ||
        (Array.isArray(output[keys[i]]) && output[keys[i]].length === 0)
      ) {
        delete output[keys[i]];
      }
    }

    return output;
  }

  ngOnDestroy() {
    this.unsubscribe.next();
  }

  trackByIndex(index, item) {
    return index;
  }

  /** Returns true if any of the filter fields in the query are not empty */
  public anyFiltersSelected(): boolean {
    const q = this.query;
    return !!(
      (
        (q.collection && q.collection !== '') ||
        q.length?.length ||
        q.topics?.length ||
        q.level?.length ||
        q.guidelines?.length ||
        q.noGuidelines ||
        q.standardOutcomes?.length ||
        q.fileTypes?.length
      )
    );
  }

  // New methods for modern browse page
  onSearchInput(event: any) {
    this.searchQuery = event.target.value;
    this.query.text = this.searchQuery;
    this.performSearch(true); // Debounced search
  }

  clearSearchInput() {
    this.searchQuery = '';
    this.query.text = '';
    this.performSearch();
  }

  setViewMode(mode: 'grid' | 'list') {
    this.viewMode = mode;
    this.cd.detectChanges();
  }

  toggleAdvancedFilters() {
    this.showAdvancedFilters = !this.showAdvancedFilters;
    this.cd.detectChanges();
  }

  toggleSortMenu() {
    this.sortMenuOpen = !this.sortMenuOpen;
    this.cd.detectChanges();
  }

  selectSort(option: any) {
    this.currentSort = option.value;
    this.sortText = option.label;
    this.sortMenuOpen = false;

    // Apply sort logic
    switch (option.value) {
      case 'newest':
        this.query.orderBy = OrderBy.Date;
        this.query.sortType = SortType.Descending;
        break;
      case 'downloads':
        this.query.orderBy = 'downloads' as OrderBy;
        this.query.sortType = SortType.Descending;
        break;
      case 'rating':
        this.query.orderBy = 'rating' as OrderBy;
        this.query.sortType = SortType.Descending;
        break;
      case 'alphabetical':
        this.query.orderBy = OrderBy.Name;
        this.query.sortType = SortType.Ascending;
        break;
      case 'duration':
        this.query.orderBy = 'length' as OrderBy;
        this.query.sortType = SortType.Ascending;
        break;
    }

    this.performSearch();
  }

  getSortDisplayName(): string {
    return this.sortOptions.find(opt => opt.value === this.currentSort)?.label || 'Newest First';
  }

  // Filter methods
  isLengthSelected(length: string): boolean {
    if (!this.query.length) {
return false;
}
    if (typeof this.query.length === 'string') {
      return this.query.length === length;
    }
    return this.query.length.includes(length);
  }

  toggleLengthFilter(length: string) {
    if (!this.query.length) {
      this.query.length = [];
    }

    // Ensure length is an array
    if (typeof this.query.length === 'string') {
      this.query.length = [this.query.length];
    }

    const index = this.query.length.indexOf(length);
    if (index > -1) {
      this.query.length.splice(index, 1);
    } else {
      this.query.length.push(length);
    }
    this.performSearch();
  }

  isLevelSelected(level: string): boolean {
    return this.query.level?.includes(level) || false;
  }

  toggleLevelFilter(level: string) {
    if (!this.query.level) {
this.query.level = [];
}
    const index = this.query.level.indexOf(level);
    if (index > -1) {
      this.query.level.splice(index, 1);
    } else {
      this.query.level.push(level);
    }
    this.performSearch();
  }

  isCollectionSelected(collection: string): boolean {
    return this.query.collection === collection;
  }

  toggleCollectionFilter(collection: string) {
    this.query.collection = this.query.collection === collection ? '' : collection;
    this.performSearch();
  }

  isTopicSelected(topic: string): boolean {
    return this.query.topics?.includes(topic) || false;
  }

  toggleTopicFilter(topic: string) {
    if (!this.query.topics) {
this.query.topics = [];
}
    const index = this.query.topics.indexOf(topic);
    if (index > -1) {
      this.query.topics.splice(index, 1);
    } else {
      this.query.topics.push(topic);
    }
    this.performSearch();
  }

  hasActiveFilters(): boolean {
    return this.anyFiltersSelected() || !!this.query.text;
  }

  getActiveFiltersCount(): number {
    let count = 0;
    if (this.query.length?.length) {
count += this.query.length.length;
}
    if (this.query.level?.length) {
count += this.query.level.length;
}
    if (this.query.collection) {
count += 1;
}
    if (this.query.topics?.length) {
count += this.query.topics.length;
}
    return count;
  }

  getActiveFilterTags(): any[] {
    const tags: any[] = [];

    if (this.query.length) {
      this.query.forEach(length => {
        const filter = this.quickLengthFilters.find(f => f.value === length);
        if (filter) {
tags.push({ type: 'length', value: length, label: filter.name });
}
      });
    }

    if (this.query.level) {
      this.query.level.forEach(level => {
        const filter = this.quickLevelFilters.find(f => f.value === level);
        if (filter) {
tags.push({ type: 'level', value: level, label: filter.name });
}
      });
    }

    if (this.query.collection) {
      tags.push({ type: 'collection', value: this.query.collection, label: this.query.collection });
    }

    return tags;
  }

  removeFilter(filter: any) {
    switch (filter.type) {
      case 'length':
        this.toggleLengthFilter(filter.value);
        break;
      case 'level':
        this.toggleLevelFilter(filter.value);
        break;
      case 'collection':
        this.query.collection = '';
        this.performSearch();
        break;
    }
  }

  resetFilters() {
    this.query = {
      ...this.query,
      text: '',
      length: [],
      level: [],
      collection: '',
      topics: [],
      currPage: 1
    };
    this.searchQuery = '';
    this.performSearch();
  }

  getStartIndex(): number {
    return ((this.query.currPage - 1) * this.query.limit) + 1;
  }

  getEndIndex(): number {
    return Math.min(this.query.currPage * this.query.limit, this.totalLearningObjects);
  }

  navigateToDetails(learningObject: any) {
    this.router.navigate(['/details', learningObject.author.username, learningObject.cuid, learningObject.version]);
  }

  private async loadCollections() {
    try {
      const collections = await this.collectionService.getCollections();
      this.collections = collections.map(collection => ({
        name: collection.name,
        value: collection.abvName || collection.name.toLowerCase().replace(/\s+/g, '_')
      })).sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
      console.warn('Failed to load collections:', error);
      // Fallback to default collections
      this.collections = [
        { name: 'Security Injections', value: 'security_injections' },
        { name: 'Intro to Cyber', value: 'intro_to_cyber' },
        { name: 'CLARK Collection', value: 'clark' },
        { name: 'Secure Coding', value: 'secure_coding_community' },
        { name: 'NCyTE', value: 'ncyte' }
      ];
    }
  }

  private async loadTopics() {
    try {
      const topics = await this.topicsService.getTopics();
      this.topTopics = topics.map(topic => ({
        name: topic.name,
        value: topic._id || topic.name.toLowerCase().replace(/\s+/g, '-')
      })).sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
      console.warn('Failed to load topics:', error);
      // Fallback to default topics
      this.topTopics = [
        { name: 'Web Security', value: 'web-security' },
        { name: 'Cryptography', value: 'cryptography' },
        { name: 'Network Security', value: 'network-security' },
        { name: 'Secure Programming', value: 'secure-programming' },
        { name: 'Risk Assessment', value: 'risk-assessment' },
        { name: 'Digital Forensics', value: 'digital-forensics' },
        { name: 'Ethics', value: 'ethics' },
        { name: 'Privacy', value: 'privacy' }
      ];
    }
  }
}
