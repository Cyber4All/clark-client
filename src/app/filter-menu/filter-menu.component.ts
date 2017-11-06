import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'filter-menu',
  templateUrl: './filter-menu.component.html',
  styleUrls: ['./filter-menu.component.scss']
})
export class FilterMenuComponent implements OnInit {

  types = [ 'Course', 'Module', 'Micromodule', 'Nanomodule' ];
  constructor() { }

  ngOnInit() {
  }

}
