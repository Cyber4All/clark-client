import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'clark-tab-menu',
  templateUrl: './tab-menu.component.html',
  styleUrls: ['./tab-menu.component.scss']
})
export class TabMenuComponent implements OnInit {

  private options = [
    {
      name: 'Files',
      class: 'far fa-folders',
    },
    {
      name: 'URLs',
      class: 'far fa-link',
    },
    {
      name: 'Notes',
      class: 'far fa-sticky-note'
    },
  ];

  constructor() { }

  ngOnInit() {
  }

}
