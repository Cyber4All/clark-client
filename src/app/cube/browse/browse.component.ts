import { ClickOutsideModule } from 'ng-click-outside';
import { Observable, Subject, Subscription } from 'rxjs/Rx';
import { SortType, OrderBy } from './../../shared/interfaces/query';
import { ModalService, ModalListElement, Position} from '../../shared/modals';
import { Router } from '@angular/router';
import { LearningObject, AcademicLevel } from '@cyber4all/clark-entity';
import { Component, OnInit, AfterViewChecked, OnDestroy } from '@angular/core';
import { LearningObjectService } from '../learning-object.service';
import { ActivatedRoute } from '@angular/router';
import { Query } from '../../shared/interfaces/query';
import { lengths } from '@cyber4all/clark-taxonomy';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/operator/map';


@Component({
  selector: 'app-browse',
  templateUrl: './browse.component.html',
  styleUrls: ['./browse.component.scss']
})
export class BrowseComponent implements OnInit, OnDestroy {
  learningObjects: LearningObject[] = [];
  private sub: any;

  query: Query = {
    text: '',
    currPage: 1,
    limit: 20,
    length: [],
    level: [],
    standardOutcomes: []
  };

  mappingsPopup = false;

  pageCount: number;
  filtering = false;
  filters: {} = {};
  filteringSubject: any;

  aLevel = Object.values(AcademicLevel);
  loLength = Array.from(lengths);

  filterInput: Observable<string>;

  subscriptions: Subscription[] = [];

  constructor(public learningObjectService: LearningObjectService, private route: ActivatedRoute,
    private router: Router, private modalService: ModalService) {
    this.learningObjects = [];
    this.sub = this.route.params.subscribe(params => {
      params['query'] ? this.query.text = params['query'] : this.query.text = '';
      document.querySelector('.search-bar input')['value'] = this.query.text;
      this.fetchLearningObjects(this.query);
    });
  }

  ngOnInit() {
    this.filteringSubject = new Subject<string>().debounceTime(650);
    this.subscriptions.push(this.filteringSubject.subscribe(() => {
      this.sendFilters();
    }));

    this.filterInput = Observable
      .fromEvent(document.querySelector('.search-bar input'), 'keyup')
      .map(x => x['currentTarget'].value).debounceTime(650);

    this.subscriptions.push(this.filterInput.subscribe(val => {
      this.router.navigate(['/browse', { query: val }]);
    }));
  }

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

  get sortString() {
    return (this.query.orderBy) ? this.query.orderBy.replace(/_/g, '')
      + ' (' + ((this.query.sortType > 0) ? 'Asc' : 'Desc') + ')' : '';
  }

  prevPage() {
    const page = +this.query.currPage - 1;
    if (page > 0) {
      this.query.currPage = page;
      this.fetchLearningObjects(this.query);

    }

  }
  nextPage() {
    const page = +this.query.currPage + 1;
    if (page <= this.pageCount) {
      this.query.currPage = page;
      this.fetchLearningObjects(this.query);
    }
  }

  goToPage(page) {
    if (page > 0 && page <= this.pageCount) {
      this.query.currPage = +page;
      this.fetchLearningObjects(this.query);

    }
  }

  toggleFilters() {
    this.filtering = !this.filtering;
  }

  addFilter(key: string, value: string) {
    if (!this.filters[key]) {
      this.filters[key] = [];
    }

    if (!this.filters[key].includes(value)) {
      this.filters[key].push(value);
      this.filteringSubject.next();
    }
  }

  removeFilter(key: string, value: string) {
    if (this.filters[key] && this.filters[key].length) {
      if (this.filters[key].includes(value)) {
        this.filters[key].splice(this.filters[key].indexOf(value), 1);
        this.filteringSubject.next();
      }
    }
  }

  checkFilters(key: string, value: string): boolean {
    return (this.filters[key]) ? this.filters[key].indexOf(value) >= 0 : false;
  }

  sendFilters() {
    if (this.filters['length']) {
      this.query.length = this.filters['length'];
    }
    if (this.filters['level']) {
      this.query.level = this.filters['level'];
    }

    console.log(this.query);

    this.fetchLearningObjects(this.query);
  }

  showSortMenu(event) {
    const currSort = (this.query.orderBy) ?
      this.query.orderBy.replace(/_/g, '') + '-' + ((this.query.sortType > 0) ? 'asc' : 'desc') : undefined;
    this.modalService.makeContextMenu(
      'SortContextMenu',
      'dropdown',
      [
        new ModalListElement('Date (Newest first)', 'date-desc', (currSort === 'date-desc') ? 'active' : undefined),
        new ModalListElement('Date (Oldest first)', 'date-asc', (currSort === 'date-asc') ? 'active' : undefined),
        new ModalListElement('Name (desc)', 'name-desc', (currSort === 'name-desc') ? 'active' : undefined),
        new ModalListElement('Name (asc)', 'name-asc', (currSort === 'name-asc') ? 'active' : undefined),
      ],
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

          this.fetchLearningObjects(this.query).then(() => {
          });
        }
      });
  }

  clearSort(event) {
    event.stopPropagation();
    this.query.orderBy = undefined;
    this.query.sortType = undefined;
    this.fetchLearningObjects(this.query);
  }

  async fetchLearningObjects(query: Query): Promise<void> {
    // Trim leading and trailing whitespace
    query.text = query.text.trim();
    try {
      this.learningObjects = await this.learningObjectService.getLearningObjects(query);
      this.pageCount = Math.ceil(this.learningObjectService.totalLearningObjects / +this.query.limit);

      return;

    } catch (e) {
      console.log(e);
    }

  }

  toggleMappingsPopup() {
    this.mappingsPopup = !this.mappingsPopup;
    this.modalService.closeAll();

    if (!this.mappingsPopup) {
      this.sendFilters();
    }
  }

  ngOnDestroy() {
    for (let i = 0; i < this.subscriptions.length; i++) {
      this.subscriptions[i].unsubscribe();
    }

    this.subscriptions = [];
  }

}
