import { LearningObjectService } from './../learning-object.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'filter-menu',
  templateUrl: './filter-menu.component.html',
  styleUrls: ['./filter-menu.component.scss']
})
export class FilterMenuComponent implements OnInit {

  types = [ 'All Types', 'Course', 'Module', 'Micromodule', 'Nanomodule', 'No Type' ];
  query = {
    type: this.types[0],
    contains: undefined
  };

  constructor(public service: LearningObjectService) { }

  ngOnInit() {
  }

  search() {
    this.service.search(this.query.contains);
  }
}
