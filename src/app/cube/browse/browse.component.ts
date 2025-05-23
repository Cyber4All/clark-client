import { takeUntil, debounceTime } from 'rxjs/operators';
import {
  Component,
  HostListener,
  OnDestroy,
  AfterViewInit,
  ChangeDetectorRef,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LearningObject } from '@entity';
import { COPY } from './browse.copy';
import { Observable, Subject } from 'rxjs';
import { OrderBy, Query, SortType } from '../../interfaces/query';
import { NavbarService } from 'app/core/client-module/navbar.service';
import { SearchService } from 'app/core/learning-object-module/search/search.service';

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
    limit: 10,
    length: [],
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
  showClearSort: boolean;
  sortText = 'Newest';

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
        // makes query based and sends request to fetch learning objects
        this.makeQuery(params);
        // with a text search and no sortType is provided, no sort is applied, otherwise apply the default sort
        this.sortText = params.text && !params.sortType ? '' : this.sortText;
        this.fetchLearningObjects(this.query);
      });
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
      } else if (val === 'na') {
        this.sortText = 'Name (Asc)';
      } else if (val === 'nd') {
        this.sortText = 'Name (Desc)';
      }
      const sort = val.charAt(0);
      const dir = val.charAt(1);
      this.query.orderBy = sort.charAt(0) === 'n' ? OrderBy.Name : OrderBy.Date;
      this.query.sortType =
        dir === 'd' ? SortType.Descending : SortType.Ascending;

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
        q.standardOutcomes?.length ||
        q.fileTypes?.length
      )
    );
  }
}
