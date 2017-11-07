import { LearningObjectService } from './../learning-object.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'filter-menu',
  templateUrl: './filter-menu.component.html',
  styleUrls: ['./filter-menu.component.scss']
})
export class FilterMenuComponent implements OnInit {

  types = [ 'Course', 'Module', 'Micromodule', 'Nanomodule' ];

  constructor(public service: LearningObjectService) { }

  ngOnInit() {
  }

  search() {
    this.service.search('cyber');
  }

}
