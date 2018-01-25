import { SuggestionQuery } from './../suggestion/suggestion.component';
import { lengths } from '@cyber4all/clark-taxonomy';
import { LearningObjectService } from './../learning-object.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'filter-menu',
  templateUrl: './filter-menu.component.html',
  styleUrls: ['./filter-menu.component.scss']
})
export class FilterMenuComponent implements OnInit {

  shouldSearch = false;
  types;
  type;
  sources = ['NCWF', 'NCWF Tasks', 'CAE', 'CS 2013'];
  query: SuggestionQuery;

  constructor(public service: LearningObjectService) {
    this.types = lengths;
    this.type = this.types[0];
    this.query = {
      text: undefined,
      filter: {
        author: this.sources[0],
        name: undefined,
        ignoreme: 'foo'
      }
    };
  }

  ngOnInit() {
  }

  search() {
    this.shouldSearch = true;
  }
  clearSearch() {
    this.shouldSearch = false;
  }
}
