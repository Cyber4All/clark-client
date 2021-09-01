
import {takeUntil, debounceTime} from 'rxjs/operators';
import { Component, HostListener, OnDestroy, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LearningObject } from '@entity';

import {
  SuggestionService
 } from '../../onion/core/suggestion.service';
 import { COPY } from './browse.copy';
import { Observable, Subject } from 'rxjs';
import { OrderBy, Query, SortType } from '../../interfaces/query';
import { LearningObjectService } from '../learning-object.service';

@Component({
  selector: 'cube-browse',
  templateUrl: './browse.component.html',
  styleUrls: ['./browse.component.scss'],
  providers: [SuggestionService]
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
    orderBy: undefined,
    sortType: undefined,
    collection: '',
    fileTypes: [],
  };

  tooltipText = {
    nanomodule: 'a Learning Object up to 1 hour in length',
    micromodule: 'a Learning Object between 1 and 4 hours in length',
    module: 'a Learning Object between 4 and 10 hours in length',
    unit: 'a Learning Object over 10 hours in length',
    course: 'a Learning Object 15 weeks in length'
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
  sortText: string;

  @HostListener('window:resize', ['$event'])
  handelResize(event) {
    this.windowWidth = event.target.innerWidth;
    this.cd.detectChanges();
  }

  constructor(
    public learningObjectService: LearningObjectService,
    private route: ActivatedRoute,
    private router: Router,
    public mappingService: SuggestionService,
    private cd: ChangeDetectorRef,
  ) {
    this.windowWidth = window.innerWidth;
    this.cd.detach();
  }

  ngAfterViewInit() {
    // used by the performSearch function (when delay is true) to add a debounce effect
    this.searchDelaySubject = new Subject<void>()
      .pipe(
        debounceTime(650),
        takeUntil(this.unsubscribe)
      )
      .subscribe(() => {
        this.performSearch();
      });

    // whenever the queryParams change, map them to the query object and perform the search
    this.route.queryParams.pipe(takeUntil(this.unsubscribe)).subscribe(async params => {
      // makes query based and sends request to fetch learning objects
      this.makeQuery(params);
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
    this.query.text = '';
    this.query.standardOutcomes = [];
    this.query.currPage = 1;
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
    this.filters = filters;
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
   * @param delay if true, triggers a debounced subject, which will call performSearch again with no delay
   */
  performSearch(delay: boolean = false) {
    if (delay) {
      this.searchDelaySubject.next();
    } else {
      if (this.filters && this.filters !== {}) {
        this.query = { ...this.filters };
      }

      // if we're adding a filter that isn't a page change, reset the currPage in query to 1
      if (this.shouldResetPage) {
        this.query.currPage = 1;
      } else {
        this.shouldResetPage = true;
      }

      this.router.navigate(['browse'], {
        queryParams: this.removeObjFalsy(this.query)
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
        this.sortText = 'Date (ASC)';
      } else if (val === 'dd') {
        this.sortText = 'Date (DESC)';
      } else if (val === 'na') {
        this.sortText = 'Name (ASC)';
      } else if (val === 'nd') {
        this.sortText = 'Name (DESC)';
      }
      const sort = val.charAt(0);
      const dir = val.charAt(1);
      this.query.orderBy =
        sort.charAt(0) === 'n' ? OrderBy.Name : OrderBy.Date;
      this.query.sortType =
        dir === 'd' ? SortType.Descending : SortType.Ascending;

      this.performSearch();
    }
  }

  clearSort(event) {
    this.showClearSort = false;
    event.stopPropagation();
    this.query.orderBy = undefined;
    this.query.sortType = undefined;
    this.performSearch();
  }


  /**
   * Takes an object of parameters and attempts to map them to the query objcet
   * @param {*} params the object returned from subscribing to the routers queryParams observable
   */
  makeQuery(params: any) {
    const paramKeys = Object.keys(params);
    // iterate params object
    for (let i = 0, l = paramKeys.length; i < l; i++) {
      const key = paramKeys[i];
      if (Object.keys(this.query).includes(key)) {
        const val = params[key];
        // this parameter is a query param, add it to the query object
        this.query[key] = val;
      }
    }
  }

  async fetchLearningObjects(query: Query) {
    this.loading = true;
    this.learningObjects = [];
    // Trim leading and trailing whitespace
    query.text = query.text ? query.text.trim() : undefined;
    try {
      const {
        learningObjects,
        total
      } = await this.learningObjectService.getLearningObjects(query);
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
}
