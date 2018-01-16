import { LearningObjectService } from './../learning-object.service';
import { Component, OnInit } from '@angular/core';
import { LearningObject } from 'clark-entity';
import { SortGroupsService } from '../shared/sort-groups.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  query: string;

  constructor(private learningObjectService: LearningObjectService, private sorter: SortGroupsService) { }

  ngOnInit() {
  }

  search() {
    // TODO: verify query contains alphanumeric characters
    if (this.query === '') {
      this.learningObjectService.clearSearch();
    } else if (this.query !== undefined) {
      this.learningObjectService.search(this.query);
    }
  }

}
