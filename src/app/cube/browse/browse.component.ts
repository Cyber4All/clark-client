
import {takeUntil, debounceTime} from 'rxjs/operators';
import { Component, HostListener, OnDestroy, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LearningObject } from '@entity';
import { lengths } from '@cyber4all/clark-taxonomy';


import {
  SuggestionService
 } from '../../onion/core/suggestion.service';
 import { FilterSection } from './components/filter/filter.component';
 import { COPY } from './browse.copy';
import { Observable, Subject } from 'rxjs';
import { AuthService } from '../../core/auth.service';
import { CollectionService } from '../../core/collection.service';
import { OrderBy, Query, SortType } from '../../interfaces/query';
import { ModalListElement, ModalService, Position } from '../../shared/modules/modals/modal.module';
import { LearningObjectService } from '../learning-object.service';
import { OutcomeService } from 'app/core/outcome.service';

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
  filters: FilterSection[] = [
    {
      name: 'collection',
      type: 'select-many',
      canSearch: false,
      values: []
    },
    {
      name: 'length',
      type: 'select-many',
      canSearch: false,
      values: [
        ...Array.from(lengths).map(l => ({
          name: l,
          toolTip: this.tooltipText[l.toLowerCase()]
        }))
      ]
    },
    {
      name: 'level',
      type: 'select-many',
      canSearch: false,
      values: [
        ...Object.values(LearningObject.Level).map(l => ({
          name: l.toLowerCase(),
          toolTip: this.tooltipText[l.toLowerCase()]
        }))
      ]
    },
    {
      name: 'guidelines',
      type: 'select-many',
      canSearch: false,
      values: []
    }
  ];
  searchDelaySubject: any;

  filterInput: Observable<string>;

  filtersDownMobile = false;
  windowWidth: number;

  unsubscribe: Subject<void> = new Subject();

  shouldResetPage = false;

  sortMenuDown: boolean;

  @HostListener('window:resize', ['$event'])
  handelResize(event) {
    this.windowWidth = event.target.innerWidth;
  }

  constructor(
    public learningObjectService: LearningObjectService,
    private route: ActivatedRoute,
    private router: Router,
    private modalService: ModalService,
    public mappingService: SuggestionService,
    private auth: AuthService,
    private collectionService: CollectionService,
    private cd: ChangeDetectorRef,
    private outcomeService: OutcomeService,
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
      /**
        Will try to retrieve the outcome sources and collection sources, if it cannot retrieve
        them it will pop the guidelines element in the array so that it does
        not appear on the page at all and it will also remove the collections element in the array
      */
      try {
        // fill outcomes array in filters
        this.outcomeSources = await this.outcomeService.getSources();
        this.filters[3].values = this.outcomeSources.map(o => ({ name: o }));
      } catch (err) {
        // remove the guidelines section of the filters since we couldn't load guidelines
        this.filters = this.filters.filter(f => f.name !== 'guidelines');
      }

      try {
        // fill collections array in filters
        const collections = await this.collectionService.getCollections();
        this.filters[0].values = collections.map(c => ({ name: c.name, value: c.abvName}));
      } catch (err) {
        // remove the collection section of the filters since we couldn't load collections
        this.filters = this.filters.filter(f => f.name !== 'collection');
      }
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

  addFilter(key: string, value: string, clearFirst?: boolean) {
    this.modifyFilter(key, value, true, clearFirst);
    if (!this.filtersDownMobile) {
      this.performSearch(true);
    }
  }

  removeFilter(key: string, value: string) {
    this.modifyFilter(key, value);
    if (!this.filtersDownMobile) {
      this.performSearch(true);
    }
  }

  clearAllFilters(sendFilters: boolean = true) {
    for (let i = 0, l = this.filters.length; i < l; i++) {
      if (this.filters[i].values) {
        for (let k = 0, j = this.filters[i].values.length; k < j; k++) {
          this.filters[i].values[k].active = false;
        }
      }
    }

    if (sendFilters) {
      this.performSearch();
    }
  }



  private modifyFilter(
    key: string,
    value: string,
    active = false,
    clearFirst?: boolean
  ) {
    for (let i = 0, l = this.filters.length; i < l; i++) {
      if (this.filters[i].name === key) {
        // found the correct filter category
        if (this.filters[i].values) {
          for (let k = 0, j = this.filters[i].values.length; k < j; k++) {
            if (clearFirst && active) {
              // for each iteration set to false if this is a select-one instance vs a select-many instance
              this.filters[i].values[k].active = false;
            }

            if (
              this.filters[i].values[k].name === value ||
              this.filters[i].values[k].value === value
            ) {
              // found the correct filter
              this.filters[i].values[k].active = active;

              if (!clearFirst) {
                // if we don't need to see every filter in this category, jsut return now
                // for efficiency
                return;
              }
            }
          }

          // if clearFirst is true, inner return won't be fired, this will prevent iterating
          // accross unneccessary categories
          return;
        }
      }
    }
  }

  /**
   * Executes a search by reading throuhg the query object and mapping it to query parameters and then re-navigating to the component
   * @param delay if true, triggers a debounced subject, which will call performSearch again with no delay
   */
  performSearch(delay: boolean = false) {
    if (delay) {
      this.searchDelaySubject.next();
    } else {
      for (let i = 0, l = this.filters.length; i < l; i++) {
        const category = this.filters[i];
        let active;

        if (category.values) {
          active = category.values.filter(v => v.active);
        } else {
          // TODO implement adding non-value (custom component) filters
          active = [];
        }

        if (active.length) {
          // there are filters in this category
          this.query[category.name] = active.map(v => v.value || v.name);
        } else {
          this.query[category.name] = [];
        }
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

  toggleSort(sort) {
    console.log(this.query);
  }

  showSortMenu(event) {
    const currSort = this.query.orderBy
      ? this.query.orderBy.replace(/_/g, '') +
        '-' +
        (this.query.sortType > 0 ? 'asc' : 'desc')
      : undefined;
    const sub = this.modalService
      .makeContextMenu(
        'SortContextMenu',
        'dropdown',
        [
          new ModalListElement(
            'Date (Newest first)',
            'date-desc',
            currSort === 'date-desc' ? 'active' : undefined
          ),
          new ModalListElement(
            'Date (Oldest first)',
            'date-asc',
            currSort === 'date-asc' ? 'active' : undefined
          ),
          new ModalListElement(
            'Name (desc)',
            'name-desc',
            currSort === 'name-desc' ? 'active' : undefined
          ),
          new ModalListElement(
            'Name (asc)',
            'name-asc',
            currSort === 'name-asc' ? 'active' : undefined
          )
        ],
        true,
        null,
        new Position(
          this.modalService.offset(event.currentTarget).left -
            (190 - event.currentTarget.offsetWidth),
          this.modalService.offset(event.currentTarget).top + 50
        )
      )
      .subscribe(val => {
        if (val !== 'null' && val.length) {
          const dir = val.split('-')[1];
          const sort = val.split('-')[0];
          this.query.orderBy =
            sort.charAt(0) === 'n' ? OrderBy.Name : OrderBy.Date;
          this.query.sortType =
            dir === 'asc' ? SortType.Ascending : SortType.Descending;

          this.performSearch();
        }
        sub.unsubscribe();
      });
  }

  clearSort(event) {
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

        // add it to filter list to force checkbox
        if (Array.isArray(val)) {
          for (let k = 0, j = val.length; k < j; k++) {
            this.modifyFilter(key, val[k], true);
          }
        } else {
          this.modifyFilter(key, val, true);
        }
      }
    }
  }

  async fetchLearningObjects(query: Query) {
    this.loading = true;
    this.learningObjects = Array(20).fill(new LearningObject());
    this.cd.detectChanges();
    // Trim leading and trailing whitespace
    query.text = query.text.trim();
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
