import { LearningObjectService } from './../learning-object.service';
import { Component, OnInit } from '@angular/core';
import { SortGroupsService } from '../shared/sort-groups.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  query: string;
  groups;

  constructor(public service: LearningObjectService, public sorter: SortGroupsService) {
    service.observeFiltered().subscribe(groups => {
      this.groups = this.sorter.sort(groups);
    });
  }

  ngOnInit() {
  }

  search() {
    // TODO: verify query contains alphanumeric characters
    if (this.query === '') {
      this.service.clearSearch();
    } else if (this.query !== undefined) {
      this.service.search(this.query);
    }
  }

}
