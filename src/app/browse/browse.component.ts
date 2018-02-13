import { ModalService } from '@cyber4all/clark-modal';
import { Router } from '@angular/router';
import { LearningObject } from '@cyber4all/clark-entity';
import { Component, OnInit } from '@angular/core';
import { LearningObjectService } from '../learning-object.service';
import { ActivatedRoute } from '@angular/router';
import { TextQuery, FilterQuery, MappingQuery } from '../shared/interfaces/query';
import { ModalListElement, Position } from '@cyber4all/clark-modal';

@Component({
  selector: 'app-browse',
  templateUrl: './browse.component.html',
  styleUrls: ['./browse.component.scss']
})
export class BrowseComponent implements OnInit {
  learningObjects: LearningObject[] = [];
  private sub: any;
  query: TextQuery = {
    text: '',
    currPage: 1,
    limit: 20
  };

  pageCount: number;
  allTitle = 'All Learning Objects';
  searchTitle = 'Results';

  pageTitle: string;
  searched = false;

  filtering = false;
  filters: {} = {};


  constructor(private learningObjectService: LearningObjectService, private route: ActivatedRoute,
    private router: Router, private modalService: ModalService) {
    this.learningObjects = [];
    this.sub = this.route.params.subscribe(params => {
      console.log(params);
      params['query'] ? this.query.text = params['query'] : this.query.text = '';
      this.fetchLearningObjects(this.query);
    });
  }

  ngOnInit() {

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
    return (this.query.sort) ? this.query.sort.charAt(0) + this.query.sort.substring(1)
    + ' (' + ((this.query.sortAscending) ? 'Asc' : 'Desc') + ')' : '';
  }

  prevPage() {
    const page = +this.query.currPage - 1
    if (page > 0) {
      this.query.currPage = page;
      this.fetchLearningObjects(this.query);

    }

  }
  nextPage() {
    const page = +this.query.currPage + 1
    if (page <= this.pageCount){
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
    }
  }

  removeFilter(key: string, value: string) {
    if (this.filters[key] && this.filters[key].length) {
      if (this.filters[key].includes(value)) {
        this.filters[key].splice(this.filters[key].indexOf(value), 1);
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
    const currSort = (this.query.sort) ? this.query.sort + '-' + ((this.query.sortAscending) ? 'asc' : 'desc') : undefined;
    this.modalService.makeContextMenu(
      'SortContextMenue',
      'dropdown',
      [
        new ModalListElement('Date (desc)', 'date-desc', (currSort === 'date-desc') ? 'active' : undefined),
        new ModalListElement('Date (asc)', 'date-asc', (currSort === 'date-asc') ? 'active' : undefined),
      ],
      null,
      new Position(
        this.modalService.offset(event.currentTarget).left - (190 - event.currentTarget.offsetWidth),
        this.modalService.offset(event.currentTarget).top + 50))
      .subscribe(val => {
        if (val !== 'null' && val.length) {
          const dir = val.split('-')[1];
          const sort = val.split('-')[0];
          this.query.sort = sort;
          this.query.sortAscending = (dir === 'asc') ? true : false;

          this.fetchLearningObjects(this.query);
        }
      });
  }

  clearSort(event) {
    event.stopPropagation();
    this.query.sort = undefined;
    this.query.sortAscending = undefined;
  }

  async fetchLearningObjects(query: TextQuery) {
    this.pageTitle = this.allTitle;

    try {
      this.learningObjects = await this.learningObjectService.getLearningObjects(query);
      this.pageCount = Math.ceil(this.learningObjectService.totalLearningObjects / +this.query.limit);

    } catch (e) {
      console.log(e);
    }
  }

}
