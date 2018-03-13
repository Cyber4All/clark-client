// TODO: is ng-click-outside being used?
import { ClickOutsideModule } from 'ng-click-outside';
import { Observable, Subject, Subscription } from 'rxjs/Rx';
import { SortType, OrderBy } from '../../shared/interfaces/query';
import { ModalService } from '../../shared/modals';
import { Router } from '@angular/router';
import { LearningObject, AcademicLevel } from '@cyber4all/clark-entity';
import { Component, OnInit, AfterViewChecked, OnDestroy } from '@angular/core';
import { LearningObjectService } from '../learning-object.service';
import { ActivatedRoute } from '@angular/router';
import { Query } from '../../shared/interfaces/query';
import { ModalListElement, Position } from '../../shared/modals';
import { lengths } from '@cyber4all/clark-taxonomy';
import { OutcomeService } from '../core/outcome.service';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/operator/map';

@Component({
  selector: 'cube-browse',
  templateUrl: './browse.component.html',
  styleUrls: ['./browse.component.scss']
})
export class BrowseComponent implements OnInit, AfterViewChecked, OnDestroy {
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


  pageCount: number;
  filtering = false;
  filters: {} = {};
  filteringSubject: any;

  aLevel = Object.values(AcademicLevel);
  loLength = Array.from(lengths);

  // TODO: sources should be fetched from an API route to allow dynamic configuration
  sources = ['NCWF', 'CAE', 'CS2013'];
  mappingsPopup = false;
  mappingsQueryInProgress = false;
  mappingsFilters: { filterText: string, author: string, date: string } = {
    filterText: '',
    author: '',
    date: ''
  };
  queriedMappings: any[] = [];
  mappingsFilterInput: Observable<string>;
  mappingsCheckbox: any;
  mappingsQueryError = false;

  filterInput: Observable<string>;

  subscriptions: Subscription[] = [];

  constructor(
    public learningObjectService: LearningObjectService,
    private route: ActivatedRoute,
    private router: Router,
    private modalService: ModalService,
    private outcomeService: OutcomeService,
  ) {
    this.learningObjects = [];
    this.sub = this.route.params.subscribe(params => {
      params['query'] ? this.query.text = params['query'] : this.query.text = '';
      document.querySelector('.search-bar input')['value'] = this.query.text;
      this.fetchLearningObjects(this.query);
    });
  }

  ngOnInit() {
    this.mappingsCheckbox = new Subject<string>().debounceTime(650);
    this.mappingsCheckbox.subscribe(val => {
      this.mappingsQueryInProgress = true;
      this.fetchLearningObjects(this.query).then(() => {
        this.mappingsQueryInProgress = false;
      });
    });

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

  ngAfterViewChecked() {
    if (this.mappingsPopup && this.mappingsFilterInput === undefined) {
      this.mappingsFilterInput = Observable
        .fromEvent(document.getElementById('mappingsFilter'), 'keyup')
        .map(x => x['currentTarget'].value).debounceTime(650);

      this.subscriptions.push(this.mappingsFilterInput.subscribe(val => {
        this.mappingsFilters.filterText = val;

        if (this.mappingsFilters.author && this.mappingsFilters.author !== '') {
          this.mappingsQueryInProgress = true;
          this.getOutcomes().then(() => {
            this.mappingsQueryInProgress = false;
          });
        }
      }));
    }
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

          this.mappingsQueryInProgress = true;
          this.fetchLearningObjects(this.query).then(() => {
            this.mappingsQueryInProgress = false;
          });
        }
      });
  }

  showSources(event) {
    this.modalService.makeContextMenu(
      'SourceContextMenu',
      'dropdown',
      this.sources.map(s => new ModalListElement(s, s, (s === this.mappingsFilters.author) ? 'active' : undefined)),
      null,
      new Position(
        this.modalService.offset(event.currentTarget).left - (190 - event.currentTarget.offsetWidth),
        this.modalService.offset(event.currentTarget).top + 50))
      .subscribe(val => {
        if (val !== 'null') {
          this.mappingsFilters.author = val;
          this.mappingsQueryInProgress = true;
          this.getOutcomes().then(() => {
            this.mappingsQueryInProgress = false;
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

  getOutcomes(): Promise<void> {
    this.mappingsQueryError = false;
    return this.outcomeService.getOutcomes(this.mappingsFilters).then(res => {
      this.queriedMappings = res;
      if (!this.queriedMappings.length && this.mappingsFilters.filterText !== '') {
        this.mappingsQueryError = true;
      }
    });
  }

  checkOutcomes(outcome): boolean {
    for (let i = 0; i < this.query.standardOutcomes.length; i++) {
      if (this.query.standardOutcomes[i]['id'] === outcome.id) {
        return true;
      }
    }
    return false;
  }

  addOutcome(outcome) {
    if (!this.checkOutcomes(outcome)) {
      const o = { id: outcome.id, name: outcome.name, source: this.mappingsFilters.author, date: outcome.date, outcome: outcome.outcome };
      (<{ id: string, name: string, date: string, outcome: string }[]>this.query.standardOutcomes).push(o);
      this.mappingsCheckbox.next();
    }
  }

  removeOutcome(outcome) {
    for (let i = 0; i < this.query.standardOutcomes.length; i++) {
      if (this.query.standardOutcomes[i]['id'] === outcome.id) {
        this.query.standardOutcomes.splice(i, 1);
        this.mappingsCheckbox.next();
        return;
      }
    }
  }

  toggleMappingsPopup() {
    this.mappingsPopup = !this.mappingsPopup;
    this.modalService.closeAll();
    if (!this.query.standardOutcomes.length) {
      this.mappingsFilters.author = '';
      this.queriedMappings = [];
    }

    if (this.mappingsFilterInput !== undefined) {
      this.mappingsFilterInput = undefined;
    }
  }

  outcomeText(text: string, max: number = 150, margin: number = 10): string {
    let outcome = text.substring(0, max);
    const spaceAfter = text.substring(max).indexOf(' ') + outcome.length;
    const spaceBefore = outcome.lastIndexOf(' ');

    if (outcome.charAt(outcome.length - 1) === '.') {
      return outcome;
    } else if (outcome.charAt(outcome.length - 1) === ' ') {
      return outcome.substring(0, outcome.length - 1) + '...';
    }

    // otherwise we're in the middle of a word and should attempt to finsih the word before adding an ellpises
    if (spaceAfter - outcome.length - 1 <= margin) {
      outcome = text.substring(0, spaceAfter);
    } else {
      outcome = text.substring(0, spaceBefore);
    }

    return outcome.trim() + '...';
  }

  ngOnDestroy() {
    for (let i = 0; i < this.subscriptions.length; i++) {
      this.subscriptions[i].unsubscribe();
    }

    this.subscriptions = [];
  }

}
