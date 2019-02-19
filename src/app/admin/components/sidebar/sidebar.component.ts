import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'clark-admin-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

  constructor(private location: Location) { }

  ngOnInit() {
  }

  /**
   * Navigate to previous location
   *
   * @memberof SidebarComponent
   */
  navigateBack() {
    this.location.back();
  }

}
