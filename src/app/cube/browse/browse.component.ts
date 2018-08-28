
import { Observable, Subject } from 'rxjs/Rx';
import { SortType, OrderBy } from '../../shared/interfaces/query';
import { ModalService, ModalListElement, Position} from '../../shared/modals';
import { Router } from '@angular/router';
import { LearningObject, AcademicLevel } from '@cyber4all/clark-entity/dist/learning-object';
import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { LearningObjectService } from '../learning-object.service';
import { ActivatedRoute } from '@angular/router';
import { Query } from '../../shared/interfaces/query';
import { lengths } from '@cyber4all/clark-taxonomy';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/takeUntil';
import {
  SuggestionService
 } from '../../onion/learning-object-builder/components/outcome-page/outcome/standard-outcomes/suggestion/services/suggestion.service';
 import { FilterSection } from '../../shared/filter/filter.component';
 import { COPY } from './browse.copy';


@Component({
  selector: 'cube-browse',
  templateUrl: './browse.component.html',
  styleUrls: ['./browse.component.scss'],
  providers: [ SuggestionService ]
})
export class BrowseComponent implements OnInit, OnDestroy {
  copy = COPY;
  learningObjects: LearningObject[] = Array(20).fill(new LearningObject);

  query: Query = {
    text: '',
    currPage: 1,
    limit: 20,
    length: [],
    level: [],
    standardOutcomes: [],
    orderBy: undefined,
    sortType: undefined,
  };

  tooltipText = {
    nanomodule: 'a Learning Object up to 1 hour in length',
    micromodule: 'a Learning Object between 1 and 4 hours in length',
    module: 'a Learning Object between 4 and 10 hours in length',
    unit: 'a Learning Object over 10 hours in length',
    course: 'a Learning Object 15 weeks in length'
  };


  loading = false;
  mappingsPopup = false;

  pageCount: number;
  filtering = false;
  filters: FilterSection[] = [
    {
      name: 'length',
      type: 'select-many',
      canSearch: false,
      values: [
        ...
        Array.from(lengths).map(l => ({name: l, initial: false, toolTip: this.tooltipText[l.toLowerCase()]})),
      ]
    },
    {
      name: 'level',
      type: 'select-many',
      canSearch: false,
      values: [
        ...
        Object.values(AcademicLevel).map(l => ({name: l.toLowerCase(), initial: false, toolTip: this.tooltipText[l.toLowerCase()]})),
      ]
    }
  ];
  searchDelaySubject: any;

  filterInput: Observable<string>;

  filtersDownMobile = false;
  tempFilters: {name: string, value: string, active?: boolean}[] = [];
  windowWidth: number;

  unsubscribe: Subject<void> = new Subject();

  @HostListener('window:resize', ['$event']) handelResize(event) {
    this.windowWidth = event.target.innerWidth;
  }

  constructor(public learningObjectService: LearningObjectService, private route: ActivatedRoute,
    private router: Router, private modalService: ModalService, public mappingService: SuggestionService) {
      this.windowWidth = window.innerWidth;
      this.learningObjects = Array(20).fill(new LearningObject);
  }

  ngOnInit() {
    // used by the performSearch function (when delay is true) to add a debounce effect
    this.searchDelaySubject = new Subject<void>().debounceTime(650);
    this.searchDelaySubject.takeUntil(this.unsubscribe).subscribe(() => {
      this.performSearch();
    });

    // whenever the queryParams change, map them to the query object and perform the search
    this.route.queryParams.takeUntil(this.unsubscribe).subscribe(params => {
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
      this.performSearch();

    }
  }

  // navigate to next page
  nextPage() {
    const page = +this.query.currPage + 1;
    if (page <= this.pageCount) {
      this.query.currPage = page;
      this.performSearch();
    }
  }

  // navigate to a numbered page
  goToPage(page) {
    if (page > 0 && page <= this.pageCount) {
      this.query.currPage = +page;
      this.performSearch();

    }
  }

  clearSearch() {
    this.query.text = '';
    this.query.standardOutcomes = [];
    this.router.navigate(['browse'], {queryParams: {}});
  }

  get sortString() {
    return (this.query.orderBy) ? this.query.orderBy.replace(/_/g, '')
      + ' (' + ((this.query.sortType > 0) ? 'Asc' : 'Desc') + ')' : '';
  }

  toggleFilters() {
    this.filtersDownMobile = !this.filtersDownMobile;
  }

  closeFilters() {
    this.tempFilters = [];
    this.toggleFilters();
  }

  /**
   * This is used only on modal layouts, injects the tempFilter storage into the query object and sends it
   */
  applyFilters() {
    for (let i = 0, l = this.tempFilters.length; i < l; i++) {
      const o = this.tempFilters[i];
      this.modifyFilter(o.name, o.value, o.active);
    }

    this.tempFilters = [];
    this.performSearch();
  }

  addFilter(key: string, value: string) {
    if (!this.filtersDownMobile) {
      this.modifyFilter(key, value, true);
      this.performSearch(true);
    } else {
      this.tempFilters.push({name: key, value, active: true});
    }
  }

  removeFilter(key: string, value: string) {
    if (!this.filtersDownMobile) {
      this.modifyFilter(key, value);
      this.performSearch(true);
    } else {
      for (let i = 0, l = this.tempFilters.length; i < l; i++) {
        const f = this.tempFilters[i];

        if (f.name === key && f.value === value) {
          this.tempFilters.splice(i, 1);
          return;
        }
      }

      // we didn't find it
      this.tempFilters.push({name: key, value, active: false});
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

    this.tempFilters = [];

    if (sendFilters) {
      this.performSearch(true);
    }
  }

  private modifyFilter(key: string, value: string, active = false) {
    for (let i = 0, l = this.filters.length; i < l; i++) {
      if (this.filters[i].name === key) {
        // found the correct filter category
        if (this.filters[i].values) {
          for (let k = 0, j = this.filters[i].type.length; k < j; k++) {
            if (this.filters[i].values[k].name === value) {
              this.filters[i].values[k].active = active;
              return;
            }
          }
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
          this.query[category.name] = active.map(v => v.name);
        } else {
          this.query[category.name] = [];
        }
      }

      this.router.navigate(['browse'], {queryParams: this.removeObjFalsy(this.query)});
    }
  }

  showSortMenu(event) {
    const currSort = (this.query.orderBy) ?
      this.query.orderBy.replace(/_/g, '') + '-' + ((this.query.sortType > 0) ? 'asc' : 'desc') : undefined;
      const sub = this.modalService.makeContextMenu(
        'SortContextMenu',
        'dropdown',
        [
          new ModalListElement('Date (Newest first)', 'date-desc', (currSort === 'date-desc') ? 'active' : undefined),
          new ModalListElement('Date (Oldest first)', 'date-asc', (currSort === 'date-asc') ? 'active' : undefined),
          new ModalListElement('Name (desc)', 'name-desc', (currSort === 'name-desc') ? 'active' : undefined),
          new ModalListElement('Name (asc)', 'name-asc', (currSort === 'name-asc') ? 'active' : undefined),
        ],
        true,
        null,
        new Position(
          this.modalService.offset(event.currentTarget).left - (190 - event.currentTarget.offsetWidth),
          this.modalService.offset(event.currentTarget).top + 50))
        .subscribe(val => {
          if (val !== 'null' && val.length) {
            const dir = val.split('-')[1];
            const sort = val.split('-')[0];
            this.query.orderBy = sort.charAt(0) === 'n' ? OrderBy.Name : OrderBy.Date;
            this.query.sortType = (dir === 'asc') ? SortType.Ascending : SortType.Descending;

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
            this.addFilter(key, val[k]);
          }
        } else {
          this.addFilter(key, val);
        }
      }
    }
  }

  async fetchLearningObjects(query: Query) {
    this.loading = true;
    this.learningObjects = Array(20).fill(new LearningObject);
    // Trim leading and trailing whitespace
    query.text = query.text.trim();
    try {
      this.learningObjects = await this.learningObjectService.getLearningObjects(query);
      this.pageCount = Math.ceil(this.learningObjectService.totalLearningObjects / +this.query.limit);
      this.loading = false;
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
      if (!output[keys[i]] || (Array.isArray(output[keys[i]]) && output[keys[i]].length === 0)) {
        delete output[keys[i]];
      }
    }

    return output;
  }

  ngOnDestroy() {
    this.unsubscribe.next();
  }

}
