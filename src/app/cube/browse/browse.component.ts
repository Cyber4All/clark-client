import { Observable, Subject, Subscription } from 'rxjs/Rx';
import { SortType, OrderBy } from './../../shared/interfaces/query';
import { ModalService, ModalListElement, Position} from '../../shared/modals';
import { Router } from '@angular/router';
import { LearningObject, AcademicLevel } from '@cyber4all/clark-entity/dist/learning-object';
import { Component, OnInit, AfterViewChecked, OnDestroy, HostListener } from '@angular/core';
import { LearningObjectService } from '../learning-object.service';
import { ActivatedRoute } from '@angular/router';
import { Query } from '../../shared/interfaces/query';
import { lengths } from '@cyber4all/clark-taxonomy';
import {  } from '@cyber4all/clark-entity';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/operator/map';
import {
  SuggestionService
 } from '../../onion/learning-object-builder/components/outcome-page/outcome/standard-outcomes/suggestion/services/suggestion.service';
 import { FilterSection } from '../../shared/filter/filter.component';


@Component({
  selector: 'cube-browse',
  templateUrl: './browse.component.html',
  styleUrls: ['./browse.component.scss'],
  providers: [ SuggestionService ]
})
export class BrowseComponent implements OnInit, OnDestroy {
  learningObjects: LearningObject[] = Array(20).fill(new LearningObject);

  query: Query = {
    text: '',
    currPage: 1,
    limit: 20,
    length: [],
    level: [],
    standardOutcomes: []
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
  filteringSubject: any;

  filterInput: Observable<string>;

  subscriptions: Subscription[] = [];
  contextMenuSubscriptions: Subscription[] = [];

  filtersDownMobile = false;
  tempFilters: {name: string, value: string, active?: boolean}[] = [];
  windowWidth: number;

  @HostListener('window:resize', ['$event']) handelResize(event) {
    this.windowWidth = event.target.innerWidth;
  }

  constructor(public learningObjectService: LearningObjectService, private route: ActivatedRoute,
    private router: Router, private modalService: ModalService, public mappingService: SuggestionService) {
      this.windowWidth = window.innerWidth;
      this.learningObjects = Array(20).fill(new LearningObject);
  }

  ngOnInit() {
    this.filteringSubject = new Subject<string>().debounceTime(350);
    this.subscriptions.push(this.filteringSubject.subscribe(() => {
      this.sendFilters();
    }));

    this.subscriptions.push(this.route.params.subscribe(params => {
      params.query ? this.query.text = params.query : this.query.text = '';

      if (params.standardOutcomes) {
        this.query.standardOutcomes = [...params.standardOutcomes.split(',')];
      } else {
        this.query.standardOutcomes = []
      }

      this.fetchLearningObjects(this.query);
    }));

    this.subscriptions.push(this.mappingService.mappedSubject.subscribe(val => {
      this.query.standardOutcomes = this.mappingService.mappedStandards;
    }));
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
      this.fetchLearningObjects(this.query);

    }
  }

  // navigate to next page
  nextPage() {
    const page = +this.query.currPage + 1;
    if (page <= this.pageCount) {
      this.query.currPage = page;
      this.fetchLearningObjects(this.query);
    }
  }

  // navigate to a numbered page
  goToPage(page) {
    if (page > 0 && page <= this.pageCount) {
      this.query.currPage = +page;
      this.fetchLearningObjects(this.query);

    }
  }

  clearSearch() {
    this.router.navigate(['browse']);
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
    this.sendFilters();
  }

  addFilter(key: string, value: string) {
    if (!this.filtersDownMobile) {
      this.modifyFilter(key, value, true);
      this.filteringSubject.next();
    } else {
      this.tempFilters.push({name: key, value, active: true});
    }
  }

  removeFilter(key: string, value: string) {
    if (!this.filtersDownMobile) {
      this.modifyFilter(key, value);
      this.filteringSubject.next();
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
      console.log(this.tempFilters);
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
      this.filteringSubject.next();
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

  // removes an outcome from list of selected outcomes
  removeMapping(outcome) {
    this.mappingService.removeMapping(outcome);
    this.query.standardOutcomes = this.mappingService.mappedStandards;
    this.fetchLearningObjects(this.query);
  }

  sendFilters() {
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

    console.log(this.query);

    this.fetchLearningObjects(this.query);
  }

  showSortMenu(event) {
    const currSort = (this.query.orderBy) ?
      this.query.orderBy.replace(/_/g, '') + '-' + ((this.query.sortType > 0) ? 'asc' : 'desc') : undefined;
      this.contextMenuSubscriptions.push(
        this.modalService.makeContextMenu(
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

              this.fetchLearningObjects(this.query);
            }
            this.contextMenuSubscriptions.map(l => l.unsubscribe());
          })
      );
  }

  clearSort(event) {
    event.stopPropagation();
    this.query.orderBy = undefined;
    this.query.sortType = undefined;
    this.fetchLearningObjects(this.query);
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

  ngOnDestroy() {
    for (let i = 0; i < this.subscriptions.length; i++) {
      this.subscriptions[i].unsubscribe();
    }

    this.subscriptions = [];
  }

}
