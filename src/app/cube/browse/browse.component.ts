import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  HostListener,
  OnDestroy,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LearningObject } from '@entity';
import { NavbarService } from 'app/core/client-module/navbar.service';
import { SearchService } from 'app/core/learning-object-module/search/search.service';
import { Observable, Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { OrderBy, Query, SortType } from '../../interfaces/query';
import { COPY } from './browse.copy';
import { FilterSectionInfo } from './components/filter-section/filter-section.component';
import { FilterComponent } from './components/filter/filter.component';

@Component({
  selector: 'cube-browse',
  templateUrl: './browse.component.html',
  styleUrls: ['./browse.component.scss'],
})
export class BrowseComponent implements AfterViewInit, OnDestroy {
  copy = COPY;
  learningObjects: LearningObject[] = [];
  totalLearningObjects = 0;
  outcomeSources: any[];

  query: Query = {
    text: '',
    currPage: 1,
    limit: 10,
    length: [],
    noGuidelines: '',
    guidelines: [],
    level: [],
    standardOutcomes: [],
    // Showcase the newest learning object
    orderBy: OrderBy.Date,
    sortType: -1,
    collection: '',
    topics: [],
    fileTypes: [],
    status: [LearningObject.Status.RELEASED],
    tags: [],
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
  showClearSort: boolean;
  sortText = 'Newest';

  // Filter dropdown management
  activeFilterDropdown: string | null = null;
  topicFilter: FilterSectionInfo;
  levelFilter: FilterSectionInfo;
  durationFilter: FilterSectionInfo;
  materialsFilter: FilterSectionInfo;

  @ViewChild(FilterComponent) filterComponent: FilterComponent;

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
    private renderer: Renderer2,
  ) {
    this.windowWidth = window.innerWidth;
    this.cd.detach();
  }

  ngAfterViewInit() {
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
        // mutates the query to an acceptable format and sends request to fetch learning objects
        this.makeQuery(params);
        // When searching, visually show that any pre-existing sorting is disabled
        this.sortText =
          this.query.text && this.query.orderBy === OrderBy.None ? '' : this.sortText;
        await this.fetchLearningObjects(this.query);
        // Initialize filter dropdowns after filter component is initialized
        this.initializeFilterDropdowns();
      });
  }

  /**
   * Initialize filter dropdown data from the filter component
   */
  private initializeFilterDropdowns() {
    // Wait for filter component to be ready (with retries)
    let attempts = 0;
    const maxAttempts = 30; // Increased for materials filter which may load slower
    const checkInterval = setInterval(() => {
      attempts++;
      if (this.filterComponent && this.filterComponent.topicFilter) {
        this.topicFilter = this.filterComponent.topicFilter;
        this.levelFilter = this.filterComponent.levelFilter;
        this.durationFilter = this.filterComponent.lengthFilter;

        // Try to get materials filter (tag-based)
        const materialsTagFilter = this.filterComponent.getMaterialsTagFilter();
        if (materialsTagFilter && materialsTagFilter.filters && materialsTagFilter.filters.length > 0) {
          this.materialsFilter = materialsTagFilter;
          console.log('Materials filter initialized with', materialsTagFilter.filters.length, 'options');
        } else if (attempts === maxAttempts) {
          // Log if materials filter never loaded
          console.warn('Materials filter not available after max attempts');
        }

        this.cd.detectChanges();

        // Only clear interval if we have the basic filters
        if (this.topicFilter && this.levelFilter && this.durationFilter) {
          clearInterval(checkInterval);
        }
      } else if (attempts >= maxAttempts) {
        clearInterval(checkInterval);
      }
    }, 100);
  }

  /**
   * Toggle a filter dropdown
   */
  toggleFilterDropdown(filterName: string | null, event?: Event) {
    if (event) {
      event.stopPropagation();
    }

    if (this.activeFilterDropdown === filterName) {
      // Close if clicking the same button
      this.activeFilterDropdown = null;
    } else {
      // Open the requested dropdown
      this.activeFilterDropdown = filterName;
    }

    this.cd.detectChanges();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    // Close dropdown when clicking outside
    const target = event.target as HTMLElement;
    if (this.activeFilterDropdown && !target.closest('.filter-dropdown-container') && !target.closest('.filter-dropdown-btn')) {
      this.activeFilterDropdown = null;
      this.cd.detectChanges();
    }
  }

  /**
   * Toggle a filter option in a dropdown
   */
  toggleFilterOption(filterType: string, option: any) {
    // Toggle the option's active state
    option.active = !option.active;

    // Update the main filter component's state to keep everything in sync
    if (this.filterComponent) {
      this.filterComponent.sendFilterChanges();
    }

    // Perform the search with the updated filters
    this.performSearch(true);
    this.cd.detectChanges();
  }

  /**
   * Handle changes from filter dropdowns
   */
  handleFilterChange() {
    this.performSearch(true);
    this.activeFilterDropdown = null;
    this.cd.detectChanges();
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
    this.query.orderBy = OrderBy.Date;
    this.sortText = 'Newest';
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
    this.updateBodyScroll();
    this.cd.detectChanges();
  }

  closeFilters() {
    this.toggleFilters();
  }

  /**
   * Prevent/allow body scroll when modal is open
   */
  private updateBodyScroll() {
    if (this.filtersDownMobile) {
      this.renderer.setStyle(document.body, 'overflow', 'hidden');
    } else {
      this.renderer.removeStyle(document.body, 'overflow');
    }
  }

  /**
   * Handle backdrop click to close modal
   */
  onBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.closeFilters();
    }
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

  toggleSortMenu(state: boolean) {
    this.sortMenuDown = state;
    this.cd.detectChanges();
  }

  toggleSort(val) {
    if (val !== null) {
      this.showClearSort = true;

      if (val === 'da') {
        this.sortText = 'Oldest';
      } else if (val === 'dd') {
        this.sortText = 'Newest';
      } else if (val === 'w') {
        this.sortText = 'Downloads ';
      }
      const sort = val.charAt(0);
      const dir = val.charAt(1);
      this.query.orderBy = sort.charAt(0) === 'w' ? OrderBy.Downloads : OrderBy.Date;
      if (sort.charAt(0) === 'd') {
        this.query.sortType =
          dir === 'd' ? SortType.Descending : SortType.Ascending;
      } else {
        this.query.sortType = SortType.Descending;
      }
      // remove date filters if previously set
      delete this.query.start;
      delete this.query.end;

      this.performSearch();
    }
  }

  clearSort(event) {
    this.showClearSort = false;
    event.stopPropagation();
    delete this.query.orderBy;
    delete this.query.sortType;
    delete this.query.start;
    delete this.query.end;
    this.sortText = '';
    this.performSearch();
  }

  /**
   * Takes an object of parameters and attempts to map them to the query objcet
   *
   * @param {*} params the object returned from subscribing to the routers queryParams observable
   */
  makeQuery(params: Record<string, string>) {
    // Helper functions to provide fall back values on erroneous query params
    function parseIntOrDefault(val: any, fallback: number): number {
      const num = typeof val === 'string' ? parseInt(val, 10) : Number(val);
      return isNaN(num) ? fallback : num;
    }

    function toStringArray(val: any): string[] {
      if (Array.isArray(val)) {
        return val.map(String);
      }
      if (typeof val === 'string') {
        return [val];
      }
      return [];
    }

    function toString(val: any, fallback: string = ''): string {
      return typeof val === 'string' ? val : fallback;
    }

    // Rebuild the query from scratch and then apply modifications from params
    // This prevents any pre-existing queries from sticking around
    this.query = {
      text: params.text,
      currPage: parseIntOrDefault(params.currPage, 1),
      limit: parseIntOrDefault(params.limit, 10),
      length: toStringArray(params.length),
      level: toStringArray(params.level),
      guidelines: toStringArray(params.guidelines),
      noGuidelines: toString(params.noGuidelines),
      standardOutcomes: [],
      orderBy: params.orderBy ? params.orderBy : OrderBy.Date,
      sortType: params.sortType ? Number(params.sortType) : -1,
      collection: params.collection || '',
      topics: toStringArray(params.topics) || [],
      fileTypes: [],
      status: [LearningObject.Status.RELEASED],
      tags: toStringArray(params.tags),
    };
  }

  async fetchLearningObjects(query: Query) {
    this.loading = true;
    this.learningObjects = [];
    // Trim leading and trailing whitespace
    query.text = query.text ? query.text.trim() : '';

    try {
      const { learningObjects, total } =
        await this.searchLearningObjectService.getLearningObjects(this.removeObjFalsy(query));
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
    return Object.keys(obj).reduce((acc, key) => {
      // Checks if the value is truthy
      if (obj[key]) {
        acc[key] = obj[key];
      }
      return acc;
      // Initialize with an empty object
    }, {});
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    // Clean up body scroll if modal was open
    this.renderer.removeStyle(document.body, 'overflow');
  }

  trackByIndex(index, item) {
    return index;
  }

  /** Returns true if any of the filter fields in the query are not empty */
  public anyFiltersSelected(): boolean {
    const q = this.query;
    return !!(
      (q.collection && q.collection !== '') ||
      q.length?.length ||
      q.topics?.length ||
      q.level?.length ||
      q.guidelines?.length ||
      q.noGuidelines ||
      q.standardOutcomes?.length ||
      q.fileTypes?.length ||
      q.tags?.length
    );
  }
}
