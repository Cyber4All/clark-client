// import { SuggestionQuery } from './../suggestion/suggestion.component';
import { lengths } from '@cyber4all/clark-taxonomy';
import { LearningObjectService } from './../learning-object.service';
import { Component, OnInit } from '@angular/core';

export interface MappingQuery {
  length: string;
  source: string;
  name: string;
}

@Component({
  selector: 'filter-menu',
  templateUrl: './filter-menu.component.html',
  styleUrls: ['./filter-menu.component.scss']
})
export class FilterMenuComponent implements OnInit {

  lengths = Array.from(lengths);
  sources = ['NCWF', 'NCWF Tasks', 'CAE', 'CS 2013'];

  query: MappingQuery = {
    length: this.lengths[0],
    source: this.sources[0],
    name: ''
  };

  constructor(private learningObjectService: LearningObjectService) {
  }

  ngOnInit() {
  }

  search() {
    this.learningObjectService.searchByMapping(this.query)
      .then((objects) => {
        // TODO: Display returned Learning Objects somewhere
        console.log(objects);
      }, (err) => console.log);
  }
  clearSearch() {
  }
}
