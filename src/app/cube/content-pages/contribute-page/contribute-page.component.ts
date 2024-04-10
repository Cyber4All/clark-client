import { Component, OnInit } from '@angular/core';
import { sections } from './copy';

@Component({
  selector: 'clark-contribute-page',
  templateUrl: './contribute-page.component.html',
  styleUrls: ['./contribute-page.component.scss']
})

export class ContributePageComponent implements OnInit {

  constructor() { }

  ngOnInit(): void { }

  title = 'Contribute';
  get tabs() {
    return Object.values(sections);
  }
}
