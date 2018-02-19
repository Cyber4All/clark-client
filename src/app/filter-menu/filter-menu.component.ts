// import { SuggestionQuery } from './../suggestion/suggestion.component';
import { lengths } from '@cyber4all/clark-taxonomy';
import { LearningObjectService } from './../learning-object.service';
import { Component, OnInit } from '@angular/core';
import { MappingQuery } from '../shared/interfaces/query';

@Component({
  selector: 'filter-menu',
  templateUrl: './filter-menu.component.html',
  styleUrls: ['./filter-menu.component.scss']
})
export class FilterMenuComponent implements OnInit {

  lengths = Array.from(lengths);
  sources = ['NCWF', 'NCWF Tasks', 'CAE', 'CS2013'];

  query: MappingQuery = {
  };

  constructor(private learningObjectService: LearningObjectService) {
  }

  ngOnInit() {
  }

  search() {
    this.learningObjectService.getLearningObjects(this.query)
      .then((objects) => {
        // TODO: Display returned Learning Objects somewhere
        console.log(objects);
      }, (err) => console.log);
  }
  clearSearch() {
  }
}
