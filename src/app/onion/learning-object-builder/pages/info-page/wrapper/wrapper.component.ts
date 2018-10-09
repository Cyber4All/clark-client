import { Component, OnInit } from '@angular/core';

import { COPY } from './wrapper.copy';

@Component({
  selector: 'clark-info-page-wrapper',
  templateUrl: './wrapper.component.html',
  styleUrls: ['./wrapper.component.scss']
})
export class WrapperComponent implements OnInit {
  copy = COPY;
  constructor() { }

  ngOnInit() {
  }

}
